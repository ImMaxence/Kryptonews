import { Router } from 'express';
import { Crypto, Rate, sequelize } from '../db.js';
import { coinDto, tickerDto } from '../lib/dto.js';
import { HttpError } from '../lib/errors.js';
import { getSettings } from '../lib/settings.js';
import { loadUser } from '../middleware/auth.js';
import { HISTORY_RANGES, UpstreamError, getHistory } from '../services/coingecko.js';

export const router = Router();

const byRank = [[sequelize.literal('`rank` IS NULL'), 'ASC'], ['rank', 'ASC']];
const latest = (rows) =>
  rows.reduce((max, row) => (row.updatedAt > max ? row.updatedAt : max), new Date(0));

const moverDto = (c) => ({ ...tickerDto(c), image: coinDto(c).image });

/** Market-wide figures computed over every listed coin (guests only receive a truncated list). */
function summarize(coins) {
  const totalMarketCap = coins.reduce((sum, c) => sum + (c.marketCap ?? 0), 0);
  const totalVolume = coins.reduce((sum, c) => sum + (c.volume24h ?? 0), 0);
  const btc = coins.find((c) => c.id === 'bitcoin');
  const moving = coins.filter((c) => Number.isFinite(c.change24h)).sort((a, b) => b.change24h - a.change24h);
  return {
    totalMarketCap,
    totalVolume,
    btcDominance: btc?.marketCap && totalMarketCap ? (btc.marketCap / totalMarketCap) * 100 : null,
    up: moving.filter((c) => c.change24h > 0).length,
    down: moving.filter((c) => c.change24h < 0).length,
    gainers: moving.slice(0, 4).map(moverDto),
    losers: moving.slice(-4).reverse().map(moverDto),
  };
}

router.get('/cryptos', async (req, res) => {
  const [user, settings, coins] = await Promise.all([
    loadUser(req),
    getSettings(),
    Crypto.findAll({ where: { listed: true }, order: byRank }),
  ]);
  const limit = settings.guestCryptoLimit;
  const limited = !user && limit > 0 && coins.length > limit;
  res.json({
    items: (limited ? coins.slice(0, limit) : coins).map(coinDto),
    total: coins.length,
    limited,
    limit: limited ? limit : null,
    updatedAt: coins.length ? latest(coins) : null,
    summary: summarize(coins),
  });
});

router.get('/cryptos/ticker', async (_req, res) => {
  const coins = await Crypto.findAll({ where: { listed: true }, order: byRank, limit: 20 });
  res.json({ items: coins.map(tickerDto), updatedAt: coins.length ? latest(coins) : null });
});

router.get('/cryptos/sitemap', async (_req, res) => {
  const coins = await Crypto.findAll({ where: { listed: true }, attributes: ['id', 'updatedAt'], order: byRank });
  res.json({ items: coins.map((c) => ({ id: c.id, updatedAt: c.updatedAt })) });
});

router.get('/cryptos/:id', async (req, res) => {
  const coin = await Crypto.findByPk(String(req.params.id).slice(0, 100));
  if (!coin) throw new HttpError(404, 'not_found');
  res.json({ item: coinDto(coin) });
});

router.get('/cryptos/:id/history', async (req, res) => {
  const range = Object.hasOwn(HISTORY_RANGES, req.query.range) ? req.query.range : '7d';
  const coin = await Crypto.findByPk(String(req.params.id).slice(0, 100), { attributes: ['id'] });
  if (!coin) throw new HttpError(404, 'not_found');
  try {
    const data = await getHistory(coin.id, range);
    res.set('cache-control', 'public, max-age=60');
    res.json(data);
  } catch (err) {
    if (err instanceof UpstreamError && err.status === 429) throw new HttpError(503, 'upstream_busy');
    throw new HttpError(502, 'upstream_error');
  }
});

router.get('/rates', async (_req, res) => {
  const rates = await Rate.findAll({ order: [['code', 'ASC']] });
  const usd = rates.find((r) => r.code === 'usd');
  if (!usd) return res.json({ base: 'usd', items: [], updatedAt: null });
  res.json({
    base: 'usd',
    updatedAt: latest(rates),
    items: rates.map((r) => ({
      code: r.code,
      name: r.name,
      unit: r.unit,
      type: r.type,
      perUsd: r.valuePerBtc / usd.valuePerBtc,
    })),
  });
});
