import { Router } from 'express';
import sharp from 'sharp';
import { Article, Crypto, Favorite } from '../db.js';
import { TtlCache } from '../lib/cache.js';
import { safeFetch } from '../lib/http.js';
import { loadUser } from '../middleware/auth.js';

/**
 * Image proxy: visitors' browsers never contact CoinGecko or news publishers
 * directly (privacy, no third-party requests). Only URLs already stored in our
 * database can be fetched, and every hop is checked against private networks.
 */
export const router = Router();

const cache = new TtlCache({ maxEntries: 800, maxBytes: 64 * 1024 * 1024 });
sharp.cache(false); // our TtlCache already keeps the encoded output
sharp.concurrency(1); // small home server: keep image work from starving the API
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

/** Some CDNs answer `application/octet-stream`: fall back to magic bytes. */
function sniff(buffer) {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.subarray(0, 4).toString('hex') === '89504e47') return 'image/png';
  if (buffer.subarray(0, 3).toString('ascii') === 'GIF') return 'image/gif';
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (buffer.subarray(4, 12).toString('ascii').startsWith('ftypavi')) return 'image/avif';
  return null;
}

async function loadImage(url) {
  const { response, body } = await safeFetch(url, {
    timeout: 10_000,
    maxBytes: 4 * 1024 * 1024,
    headers: { accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8' },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const declared = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const type = ALLOWED_TYPES.has(declared) ? declared : sniff(body);
  if (!type) throw new Error('not_an_image');
  return { type, body };
}

/**
 * Resize to the width the layout actually uses and re-encode as WebP: article
 * pictures often weigh 500 KB+ at full size. Pixel limit guards against
 * decompression bombs; on any failure the original is served.
 */
async function optimize(image, width) {
  if (!width) return image;
  try {
    const body = await sharp(image.body, { limitInputPixels: 40_000_000, animated: false })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72, effort: 4 })
      .toBuffer();
    return body.length < image.body.length ? { type: 'image/webp', body } : image;
  } catch {
    return image;
  }
}

async function sendImage(res, key, url, ttlSeconds, visibility = 'public', width = 0) {
  if (!url) return res.status(404).set('cache-control', `${visibility}, max-age=600`).json({ error: 'not_found' });
  try {
    const image = await cache.getOrLoad(
      key,
      ttlSeconds * 1000,
      async () => optimize(await loadImage(url), width),
      (value) => value.body.length,
    );
    res.set({
      'content-type': image.type,
      'cache-control': `${visibility}, max-age=${ttlSeconds}, stale-while-revalidate=86400`,
      'content-security-policy': "default-src 'none'; sandbox",
      'cross-origin-resource-policy': 'same-origin',
    });
    return res.send(image.body);
  } catch {
    return res.status(404).set('cache-control', `${visibility}, max-age=600`).json({ error: 'not_found' });
  }
}

router.get('/coin/:id', async (req, res) => {
  const coin = await Crypto.findByPk(String(req.params.id).slice(0, 100), { attributes: ['id', 'image'] });
  const size = req.query.size === 'large' ? 'large' : 'small';
  const url = coin?.image ? coin.image.replace('/large/', `/${size}/`) : null;
  return sendImage(res, `coin:${coin?.id}:${size}`, url, 7 * 86_400, 'public', size === 'large' ? 160 : 0);
});

router.get('/article/:id', async (req, res) => {
  const article = await Article.findByPk(Number(req.params.id) || 0, { attributes: ['id', 'imageUrl'] });
  return sendImage(res, `article:${article?.id}`, article?.imageUrl, 7 * 86_400, 'public', 960);
});

// Only the owner can load a clipping's image (ids are sequential: no enumeration of what others saved).
router.get('/favorite/:id', async (req, res) => {
  const user = await loadUser(req);
  const favorite = user?.id
    ? await Favorite.findOne({ where: { id: Number(req.params.id) || 0, userId: user.id }, attributes: ['id', 'kind', 'image'] })
    : null;
  const url = favorite?.kind === 'article' ? favorite.image : null;
  res.set('vary', 'cookie');
  return sendImage(res, `favorite:${favorite?.id}`, url, 7 * 86_400, 'private', 960);
});
