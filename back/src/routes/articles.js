import { Router } from 'express';
import { Op } from 'sequelize';
import { Article, Crypto, Feed } from '../db.js';
import { articleDto } from '../lib/dto.js';
import { HttpError, parse } from '../lib/errors.js';
import { articleQuerySchema } from '../lib/schemas.js';
import { getSettings } from '../lib/settings.js';
import { loadUser } from '../middleware/auth.js';

export const router = Router();

const likeEscape = (value) => `%${value.replace(/[\\%_]/g, '\\$&')}%`;
const regexEscape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Tickers that are also everyday words would match unrelated headlines.
const AMBIGUOUS_SYMBOLS = new Set(['ONE', 'GAS', 'SUN', 'KEY', 'CAT', 'DOG', 'APE', 'TON', 'ICP', 'PEOPLE', 'OM', 'S', 'HT']);

router.get('/', async (req, res) => {
  const query = parse(articleQuerySchema, req.query);
  const [user, settings] = await Promise.all([loadUser(req), getSettings()]);

  const and = [];
  if (query.lang) and.push({ lang: query.lang });
  if (query.source) and.push({ source: query.source });
  if (query.q) {
    and.push({
      [Op.or]: [{ title: { [Op.like]: likeEscape(query.q) } }, { summary: { [Op.like]: likeEscape(query.q) } }],
    });
  }
  if (query.coin) {
    const coin = await Crypto.findByPk(query.coin, { attributes: ['name', 'symbol'] });
    if (!coin) throw new HttpError(404, 'not_found');
    const terms = [coin.name];
    if (coin.symbol.length >= 3 && !AMBIGUOUS_SYMBOLS.has(coin.symbol)) terms.push(coin.symbol);
    and.push({ [Op.or]: terms.map((term) => ({ title: { [Op.regexp]: `\\b${regexEscape(term)}\\b` } })) });
  }

  const guestLimit = user ? 0 : settings.guestNewsLimit;
  const offset = (query.page - 1) * query.pageSize;
  let limit = query.pageSize;
  if (guestLimit > 0) limit = Math.max(0, Math.min(query.pageSize, guestLimit - offset));

  const where = and.length ? { [Op.and]: and } : {};
  const [total, rows] = await Promise.all([
    Article.count({ where }),
    limit > 0
      ? Article.findAll({ where, order: [['publishedAt', 'DESC'], ['id', 'DESC']], offset, limit })
      : Promise.resolve([]),
  ]);

  const reachable = guestLimit > 0 ? Math.min(total, guestLimit) : total;
  res.json({
    items: rows.map(articleDto),
    total,
    page: query.page,
    pageSize: query.pageSize,
    hasMore: offset + rows.length < reachable,
    limited: guestLimit > 0 && total > guestLimit,
    limit: guestLimit > 0 ? guestLimit : null,
  });
});

router.get('/sources', async (_req, res) => {
  const feeds = await Feed.findAll({ where: { enabled: true }, attributes: ['name', 'lang'], order: [['name', 'ASC']] });
  res.json({ items: feeds.map((f) => ({ name: f.name, lang: f.lang })) });
});

router.get('/:id', async (req, res) => {
  const article = await Article.findByPk(Number(req.params.id) || 0);
  if (!article) throw new HttpError(404, 'not_found');
  res.json({ item: articleDto(article) });
});
