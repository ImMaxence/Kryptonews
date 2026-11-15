import { createHash, randomBytes, randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { config, googleEnabled } from '../config.js';
import { AccessRequest, User } from '../db.js';
import { publicUser } from '../lib/dto.js';
import { HttpError, parse } from '../lib/errors.js';
import { fetchJson } from '../lib/http.js';
import { log } from '../lib/log.js';
import { accessRequestSchema, loginSchema, passwordSchema } from '../lib/schemas.js';
import { userFromResetToken } from '../lib/reset.js';
import { clearSessionCookie, guestUser, loadUser, requireAuth, setGuestCookie, setSessionCookie } from '../middleware/auth.js';
import { challengeLimiter, credentialsLimiter, guestLimiter, sensitiveLimiter, signupDailyLimiter, signupHourlyLimiter } from '../middleware/security.js';
import { createChallenge, verifySolution } from '../lib/pow.js';
import { getSettings } from '../lib/settings.js';
import { Op } from 'sequelize';

/**
 * Readers: email + password. Editors: Google sign-in, restricted to ADMIN_EMAILS.
 * Visitors can also open a read-only guest (demo) session.
 */
export const router = Router();

// Compared against when the user does not exist, so response time does not leak account existence.
const DUMMY_HASH = bcrypt.hashSync(randomBytes(16).toString('hex'), 12);
const DESK_PATHS = { en: '/en/editors-desk', fr: '/fr/redaction' };
const OAUTH_COOKIE = 'kn_oauth';

export async function assertAvailable({ username, email }, excludeId = null) {
  if (username) {
    const user = await User.findOne({ where: { username }, attributes: ['id'] });
    if (user && user.id !== excludeId) throw new HttpError(409, 'username_taken');
  }
  if (email) {
    const user = await User.findOne({ where: { email }, attributes: ['id'] });
    if (user && user.id !== excludeId) throw new HttpError(409, 'email_taken');
  }
}

/** Display name derived from a name or an email, made unique. */
export async function uniqueUsername(raw) {
  let base = String(raw || '')
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}_.-]+/gu, '')
    .slice(0, 26);
  if (base.length < 3) base = `reader${base}`;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}${randomInt(1000, 10000)}`;
    if (!(await User.findOne({ where: { username: candidate }, attributes: ['id'] }))) return candidate;
  }
  return `reader${Date.now().toString(36)}`;
}

/**
 * Global circuit breaker for access requests: caps new requests per hour and per day across
 * every IP, the pending queue and the total number of accounts, so a bot farm can neither
 * fill the database nor bury real requests under thousands of fake ones.
 */
export async function assertRequestsAllowed() {
  const settings = await getSettings();
  if (!settings.signupsOpen) throw new HttpError(503, 'signups_closed');
  const now = Date.now();
  const [accounts, pending, lastHour, lastDay] = await Promise.all([
    User.count(),
    AccessRequest.count(),
    AccessRequest.count({ where: { createdAt: { [Op.gte]: new Date(now - 3_600_000) } } }),
    AccessRequest.count({ where: { createdAt: { [Op.gte]: new Date(now - 86_400_000) } } }),
  ]);
  if (accounts >= config.signup.maxAccounts) throw new HttpError(503, 'signups_closed');
  if (lastHour >= config.signup.maxPerHour || lastDay >= config.signup.maxPerDay) {
    log.warn(`Access requests paused by the circuit breaker (${lastHour}/h, ${lastDay}/day)`);
    throw new HttpError(503, 'signups_paused');
  }
  if (pending >= config.signup.maxPending) {
    log.warn(`Access request queue full (${pending} pending)`);
    throw new HttpError(503, 'requests_full');
  }
}

/** Proof-of-work challenge for the access request form. */
router.get('/challenge', challengeLimiter, (_req, res) => {
  res.set('cache-control', 'no-store');
  res.json(createChallenge());
});

/**
 * Access request: readers never create accounts themselves. An editor reviews the request
 * on the desk and emails the reader their credentials.
 */
router.post('/access-request', signupDailyLimiter, signupHourlyLimiter, async (req, res) => {
  const body = parse(accessRequestSchema, req.body);
  // Honeypot filled in: pretend it worked, so the bot learns nothing.
  if (body.website) return res.status(202).json({ received: true });
  if (!verifySolution(body.pow)) throw new HttpError(400, 'challenge_failed');
  await assertRequestsAllowed();
  // Same answer whether or not the email is already known (no account enumeration, no duplicates).
  const known = (await User.count({ where: { email: body.email } })) || (await AccessRequest.count({ where: { email: body.email } }));
  if (!known) {
    await AccessRequest.create({ email: body.email, firstName: body.firstName, lastName: body.lastName, locale: body.locale });
    log.info('New access request received');
  }
  res.status(202).json({ received: true });
});

router.post('/login', credentialsLimiter, async (req, res) => {
  const { identifier, password } = parse(loginSchema, req.body);
  const where = identifier.includes('@') ? { email: identifier.toLowerCase() } : { username: identifier };
  const user = await User.findOne({ where });
  const valid = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);
  if (!user || !user.passwordHash || !valid) throw new HttpError(401, 'invalid_credentials');
  await user.update({ lastLoginAt: new Date() });
  setSessionCookie(res, user);
  res.json({ user: publicUser(user) });
});

/** Redeems an editor-issued reset link: sets the new password and signs the reader in. */
router.post('/reset', sensitiveLimiter, async (req, res) => {
  const password = parse(passwordSchema, req.body?.password);
  const user = await userFromResetToken(req.body?.token);
  if (!user) throw new HttpError(400, 'reset_invalid');
  await user.update({
    passwordHash: await bcrypt.hash(password, 12),
    tokenVersion: user.tokenVersion + 1, // signs out every other session
    mustChangePassword: false,
    lastLoginAt: new Date(),
  });
  setSessionCookie(res, user);
  res.json({ user: publicUser(user) });
});

/** Opens a read-only demo session filled with fake data. */
router.post('/guest', guestLimiter, (req, res) => {
  const locale = req.body?.locale === 'fr' ? 'fr' : 'en';
  setGuestCookie(res, locale);
  res.status(201).json({ user: publicUser(guestUser(locale)) });
});

router.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

/* ───────────────────── Google sign-in (editors only, OAuth 2.0 + PKCE) ───────────────────── */

const oauthCookieOptions = () => ({ httpOnly: true, secure: config.cookieSecure, sameSite: 'lax', path: '/api/auth' });
const redirectUri = () => `${config.publicUrl}/api/auth/google/callback`;
export const isEditorEmail = (email) => Boolean(email) && config.admin.googleEmails.includes(String(email).toLowerCase());

/**
 * Finds or creates the editor account for a Google identity. Callers must have
 * checked that the email is verified and listed in ADMIN_EMAILS.
 */
export async function upsertEditor(profile, locale) {
  const linked = await User.findOne({ where: { googleId: profile.id } });
  if (linked) return { user: linked };

  const existing = await User.findOne({ where: { email: profile.email } });
  if (existing) {
    if (existing.googleId) return { error: 'oauth_email_conflict' };
    const patch = { googleId: profile.id };
    // Access-request emails are never verified: a reader account may hold an editor's address
    // first. Google just proved ownership, so drop that password and its sessions
    // (account pre-hijacking defence). The seeded editor keeps its own password.
    if (existing.passwordHash && existing.role !== 'admin') {
      patch.passwordHash = null;
      patch.tokenVersion = existing.tokenVersion + 1;
    }
    await existing.update(patch);
    return { user: existing };
  }

  const user = await User.create({
    username: await uniqueUsername(profile.name || profile.email.split('@')[0]),
    email: profile.email,
    googleId: profile.id,
    role: 'admin',
    avatar: randomInt(1, 7),
    locale,
  });
  return { user };
}

async function googleProfile(accessToken) {
  const res = await fetchJson('https://openidconnect.googleapis.com/v1/userinfo', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return null;
  const p = await res.json();
  return {
    id: String(p.sub),
    email: typeof p.email === 'string' ? p.email.toLowerCase() : null,
    emailVerified: p.email_verified === true,
    name: p.given_name || p.name,
  };
}

router.get('/google', (req, res) => {
  if (!googleEnabled()) throw new HttpError(404, 'oauth_disabled');
  const locale = req.query.locale === 'fr' ? 'fr' : 'en';
  const state = randomBytes(24).toString('base64url');
  const verifier = randomBytes(32).toString('base64url');
  res.cookie(OAUTH_COOKIE, [state, locale, verifier].join('.'), { ...oauthCookieOptions(), maxAge: 10 * 60_000 });

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: config.google.clientId,
    response_type: 'code',
    redirect_uri: redirectUri(),
    scope: 'openid email profile',
    prompt: 'select_account',
    state,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    code_challenge_method: 'S256',
  }).toString();
  res.redirect(url.toString());
});

router.get('/google/callback', async (req, res) => {
  const [expectedState, rawLocale, verifier] = String(req.cookies?.[OAUTH_COOKIE] || '').split('.');
  const locale = rawLocale === 'fr' ? 'fr' : 'en';
  res.clearCookie(OAUTH_COOKIE, oauthCookieOptions());
  const desk = `${config.publicUrl}${DESK_PATHS[locale]}`;
  const fail = (reason) => res.redirect(`${desk}?error=${reason}`);

  if (!googleEnabled()) return fail('oauth_disabled');
  if (req.query.error) return fail('oauth_denied');
  if (!expectedState || !verifier || req.query.state !== expectedState || typeof req.query.code !== 'string') {
    return fail('oauth_state');
  }

  try {
    const tokenResponse = await fetchJson('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        grant_type: 'authorization_code',
        code: req.query.code,
        code_verifier: verifier,
        redirect_uri: redirectUri(),
      }),
    });
    if (!tokenResponse.ok) return fail('oauth_failed');
    const { access_token: accessToken } = await tokenResponse.json();

    const profile = await googleProfile(accessToken);
    if (!profile?.id) return fail('oauth_failed');
    if (!profile.emailVerified || !profile.email) return fail('oauth_unverified');
    // Only addresses listed in ADMIN_EMAILS may use Google: nothing is created otherwise.
    if (!isEditorEmail(profile.email)) {
      log.warn('Google sign-in refused for an address not listed in ADMIN_EMAILS');
      return fail('oauth_not_editor');
    }

    const { user, error } = await upsertEditor(profile, locale);
    if (error) return fail(error);
    await user.update({ role: 'admin', lastLoginAt: new Date() });
    setSessionCookie(res, user);
    return res.redirect(desk);
  } catch (err) {
    log.warn(`Google sign-in failed: ${err.message}`);
    return fail('oauth_failed');
  }
});

export { loadUser };
