import { Router } from 'express';
import { Article, Crypto, Favorite } from '../db.js';
import { favoriteDto } from '../lib/dto.js';
import { HttpError, parse } from '../lib/errors.js';
import { favoriteSchema } from '../lib/schemas.js';
import { forbidGuest, requireAuth } from '../middleware/auth.js';
import { demoFavorites } from '../services/demo.js';

export const router = Router();
router.use(requireAuth);

const MAX_FAVORITES = 500;

const toDto = (favorite, coin) => {
  const dto = favoriteDto(favorite, coin);
  // Article images go through the media proxy so they outlive the article itself.
  if (favorite.kind === 'article') dto.image = favorite.image ? `/api/media/favorite/${favorite.id}` : null;
  return dto;
};

router.get('/', async (req, res) => {
  if (req.user.isGuest) return res.json({ items: await demoFavorites(), demo: true });
  const favorites = await Favorite.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
  const coinIds = favorites.filter((f) => f.kind === 'crypto').map((f) => f.refId);
  const coins = coinIds.length ? await Crypto.findAll({ where: { id: coinIds } }) : [];
  const byId = new Map(coins.map((c) => [c.id, c]));
  res.json({ items: favorites.map((f) => toDto(f, byId.get(f.refId))) });
});

router.post('/', forbidGuest, async (req, res) => {
  const { kind, refId } = parse(favoriteSchema, req.body);
  const userId = req.user.id;

  const existing = await Favorite.findOne({ where: { userId, kind, refId } });
  if (existing) return res.json({ item: toDto(existing) });
  if ((await Favorite.count({ where: { userId } })) >= MAX_FAVORITES) throw new HttpError(409, 'too_many_favorites');

  let snapshot;
  let coin = null;
  if (kind === 'article') {
    const article = await Article.findByPk(Number(refId) || 0);
    if (!article) throw new HttpError(404, 'not_found');
    snapshot = { title: article.title, url: article.link, image: article.imageUrl, source: article.source };
  } else {
    coin = await Crypto.findByPk(refId);
    if (!coin) throw new HttpError(404, 'not_found');
    snapshot = { title: coin.name, url: null, image: null, source: coin.symbol };
  }

  const favorite = await Favorite.create({ userId, kind, refId, ...snapshot });
  res.status(201).json({ item: toDto(favorite, coin) });
});

router.delete('/:id', forbidGuest, async (req, res) => {
  const removed = await Favorite.destroy({ where: { id: Number(req.params.id) || 0, userId: req.user.id } });
  if (!removed) throw new HttpError(404, 'not_found');
  res.status(204).end();
});
