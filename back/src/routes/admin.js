import { Router } from 'express';
import { Op } from 'sequelize';
import { config } from '../config.js';
import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { AccessRequest, Article, Crypto, Feed, User, sequelize } from '../db.js';
import { feedDto } from '../lib/dto.js';
import { HttpError, parse } from '../lib/errors.js';
import { UnsafeUrlError, assertPublicHttpUrl } from '../lib/http.js';
import { feedPatchSchema, feedSchema, roleSchema, settingsSchema } from '../lib/schemas.js';
import { getSettings, syncState, updateSettings } from '../lib/settings.js';
import { requireAdmin } from '../middleware/auth.js';
import { syncMarkets, syncRates } from '../services/coingecko.js';
import { demoCounts, demoRequests, demoUsers } from '../services/demo.js';
import { uniqueUsername } from './auth.js';
import { RESET_TTL_MINUTES, createResetToken } from '../lib/reset.js';
import { log } from '../lib/log.js';
import { fetchFeed, syncNews } from '../services/news.js';

export const router = Router();
router.use(requireAdmin);

async function articleCounts() {
  const rows = await Article.findAll({
    attributes: ['feedId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['feedId'],
    raw: true,
  });
  return new Map(rows.map((row) => [row.feedId, Number(row.count)]));
}

async function findFeed(id) {
  const feed = await Feed.findByPk(Number(id) || 0);
  if (!feed) throw new HttpError(404, 'not_found');
  return feed;
}

async function assertSafeFeedUrl(url) {
  try {
    await assertPublicHttpUrl(url);
  } catch (err) {
    if (err instanceof UnsafeUrlError || err.code === 'ENOTFOUND') {
      throw new HttpError(400, 'validation', { fields: { url: 'unsafe_url' } });
    }
    throw err;
  }
}

async function assertFeedUnique({ name, url }, excludeId = null) {
  const clash = await Feed.findOne({
    where: { [Op.or]: [name ? { name } : null, url ? { url } : null].filter(Boolean) },
  });
  if (clash && clash.id !== excludeId) throw new HttpError(409, 'feed_exists');
}

router.get('/overview', async (req, res) => {
  const [users, admins, articles, feeds, coins, settings, pending, lastDay] = await Promise.all([
    User.count(),
    User.count({ where: { role: 'admin' } }),
    Article.count(),
    Feed.count(),
    Crypto.count({ where: { listed: true } }),
    getSettings(),
    AccessRequest.count(),
    AccessRequest.count({ where: { createdAt: { [Op.gte]: new Date(Date.now() - 86_400_000) } } }),
  ]);
  const counts = { users, admins, articles, feeds, coins };
  res.json({
    counts: req.user.isGuest ? demoCounts(counts) : counts,
    sync: syncState,
    settings,
    articleRetentionDays: config.articleRetentionDays,
    signups: {
      open: settings.signupsOpen,
      pending: req.user.isGuest ? demoRequests().length : pending,
      lastDay: req.user.isGuest ? 2 : lastDay,
      maxPending: config.signup.maxPending,
      pendingDays: config.signup.pendingDays,
      maxPerHour: config.signup.maxPerHour,
      maxPerDay: config.signup.maxPerDay,
      maxAccounts: config.signup.maxAccounts,
    },
    version: config.version,
    demo: Boolean(req.user.isGuest),
  });
});

router.get('/feeds', async (_req, res) => {
  const [feeds, counts] = await Promise.all([Feed.findAll({ order: [['lang', 'ASC'], ['name', 'ASC']] }), articleCounts()]);
  res.json({ items: feeds.map((f) => feedDto(f, counts.get(f.id) ?? 0)) });
});

router.post('/feeds', async (req, res) => {
  const body = parse(feedSchema, req.body);
  await assertSafeFeedUrl(body.url);
  await assertFeedUnique(body);
  const feed = await Feed.create(body);
  if (feed.enabled) await fetchFeed(feed);
  const counts = await articleCounts();
  res.status(201).json({ item: feedDto(feed, counts.get(feed.id) ?? 0) });
});

router.patch('/feeds/:id', async (req, res) => {
  const feed = await findFeed(req.params.id);
  const body = parse(feedPatchSchema, req.body);
  if (body.url) await assertSafeFeedUrl(body.url);
  await assertFeedUnique(body, feed.id);
  await feed.update(body);
  if (body.name || body.lang) {
    await Article.update({ source: feed.name, lang: feed.lang }, { where: { feedId: feed.id } });
  }
  const counts = await articleCounts();
  res.json({ item: feedDto(feed, counts.get(feed.id) ?? 0) });
});

router.delete('/feeds/:id', async (req, res) => {
  const feed = await findFeed(req.params.id);
  await feed.destroy();
  res.status(204).end();
});

router.post('/feeds/:id/refresh', async (req, res) => {
  const feed = await findFeed(req.params.id);
  await fetchFeed(feed);
  const counts = await articleCounts();
  res.json({ item: feedDto(feed, counts.get(feed.id) ?? 0) });
});

router.put('/settings', async (req, res) => {
  const body = parse(settingsSchema, req.body);
  res.json({ settings: await updateSettings(body) });
});

router.get('/users', async (req, res) => {
  // Real readers are never shown to the demo session.
  if (req.user.isGuest) return res.json({ items: demoUsers(), demo: true });
  const users = await User.findAll({ order: [['createdAt', 'DESC']], limit: 200 });
  res.json({
    items: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      googleLinked: Boolean(u.googleId),
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    })),
  });
});

router.patch('/users/:id', async (req, res) => {
  const { role } = parse(roleSchema, req.body);
  const user = await User.findByPk(Number(req.params.id) || 0);
  if (!user) throw new HttpError(404, 'not_found');
  if (user.role === 'admin' && role !== 'admin' && (await User.count({ where: { role: 'admin' } })) <= 1) {
    throw new HttpError(409, 'last_admin');
  }
  await user.update({ role });
  res.json({ item: { id: user.id, role: user.role } });
});

const RESET_PATHS = { en: '/en/reset-password', fr: '/fr/mot-de-passe' };
const LOGIN_PATHS = { en: '/en/login', fr: '/fr/connexion' };

/* ───────────────────── Access requests ───────────────────── */

const requestDto = (r) => ({ id: r.id, firstName: r.firstName, lastName: r.lastName, email: r.email, locale: r.locale, createdAt: r.createdAt });

router.get('/requests', async (req, res) => {
  if (req.user.isGuest) return res.json({ items: demoRequests(), demo: true });
  const items = await AccessRequest.findAll({ order: [['createdAt', 'ASC']], limit: config.signup.maxPending });
  res.json({ items: items.map(requestDto) });
});

/** Easy to read aloud or retype, ~80 bits of entropy: e.g. "k7mq-3xtw-9fhe-2rpa". */
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
export function temporaryPassword() {
  const chars = Array.from({ length: 16 }, () => ALPHABET[randomInt(ALPHABET.length)]);
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join('')).join('-');
}

/** The email the editor sends, in the reader's language. */
export function credentialsMessage({ locale, firstName, email, password, loginUrl }) {
  if (locale === 'fr') {
    return {
      subject: 'Votre accès à Kryptonews',
      body: [
        `Bonjour ${firstName},`,
        '',
        'Votre demande d’accès à Kryptonews est acceptée. Voici vos identifiants :',
        '',
        `Connexion : ${loginUrl}`,
        `E-mail : ${email}`,
        `Mot de passe temporaire : ${password}`,
        '',
        'Vous choisirez votre propre mot de passe à la première connexion.',
        '',
        'Bonne lecture,',
        'La rédaction de Kryptonews',
      ].join('\n'),
    };
  }
  return {
    subject: 'Your Kryptonews access',
    body: [
      `Hello ${firstName},`,
      '',
      'Your request for a Kryptonews account has been approved. Here are your login details:',
      '',
      `Log in: ${loginUrl}`,
      `Email: ${email}`,
      `Temporary password: ${password}`,
      '',
      'You will choose your own password the first time you log in.',
      '',
      'Happy reading,',
      'The Kryptonews editors',
    ].join('\n'),
  };
}

/**
 * Approves a request: creates the reader with a temporary password (returned once, never
 * stored in clear) that they must change at first login. The editor emails it to them.
 */
router.post('/requests/:id/approve', async (req, res) => {
  const request = await AccessRequest.findByPk(Number(req.params.id) || 0);
  if (!request) throw new HttpError(404, 'not_found');
  if (await User.count({ where: { email: request.email } })) {
    await request.destroy();
    throw new HttpError(409, 'email_taken');
  }
  const password = temporaryPassword();
  const user = await User.create({
    username: await uniqueUsername(`${request.firstName}.${request.lastName}`.toLowerCase()),
    email: request.email,
    passwordHash: await bcrypt.hash(password, 12),
    mustChangePassword: true,
    avatar: randomInt(1, 7),
    locale: request.locale,
  });
  await request.destroy();
  log.info(`Access request approved by editor #${req.user.id}: reader #${user.id} created`);
  const loginUrl = `${config.publicUrl}${LOGIN_PATHS[user.locale === 'fr' ? 'fr' : 'en']}`;
  res.status(201).json({
    to: user.email,
    password,
    message: credentialsMessage({ locale: user.locale, firstName: request.firstName, email: user.email, password, loginUrl }),
  });
});

router.delete('/requests/:id', async (req, res) => {
  const deleted = await AccessRequest.destroy({ where: { id: Number(req.params.id) || 0 } });
  if (!deleted) throw new HttpError(404, 'not_found');
  log.info(`Access request declined by editor #${req.user.id}`);
  res.status(204).end();
});

/** Clears the whole queue in one go (e.g. after a wave of junk requests). */
router.delete('/requests', async (req, res) => {
  const deleted = await AccessRequest.destroy({ where: {} });
  log.info(`${deleted} access requests cleared by editor #${req.user.id}`);
  res.json({ deleted });
});

/** One-hour, single-use password reset link, to be sent to the reader's own email address. */
router.post('/users/:id/reset-link', async (req, res) => {
  const user = await User.findByPk(Number(req.params.id) || 0);
  if (!user) throw new HttpError(404, 'not_found');
  if (user.role === 'admin') throw new HttpError(409, 'reset_editor');
  const token = createResetToken(user);
  log.info(`Password reset link issued by editor #${req.user.id} for reader #${user.id}`);
  res.json({
    url: `${config.publicUrl}${RESET_PATHS[user.locale === 'fr' ? 'fr' : 'en']}?token=${encodeURIComponent(token)}`,
    email: user.email,
    expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60_000),
  });
});

const SYNC_JOBS = { markets: syncMarkets, news: syncNews, rates: syncRates };

router.post('/sync/:job', async (req, res) => {
  const job = SYNC_JOBS[req.params.job];
  if (!job) throw new HttpError(404, 'not_found');
  try {
    await job();
  } catch {
    // The error is recorded in syncState and shown on the desk.
  }
  res.json({ sync: syncState });
});
