import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../db.js';
import { HttpError } from '../lib/errors.js';

export const SESSION_COOKIE = 'kn_session';

const cookieOptions = () => ({
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: 'lax',
  path: '/',
});

export function setSessionCookie(res, user) {
  // 'typ' separates session, guest and reset tokens signed with the same secret.
  const token = jwt.sign({ typ: 'session', v: user.tokenVersion }, config.jwtSecret, {
    algorithm: 'HS256',
    subject: String(user.id),
    expiresIn: `${config.sessionTtlDays}d`,
  });
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: config.sessionTtlDays * 86_400_000 });
}

/** Guest (demo) session: no database row, short-lived, read-only everywhere. */
export function setGuestCookie(res, locale) {
  const token = jwt.sign({ typ: 'guest', l: locale }, config.jwtSecret, {
    algorithm: 'HS256',
    subject: 'guest',
    expiresIn: `${config.guestSessionHours}h`,
  });
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: config.guestSessionHours * 3_600_000 });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}

export function guestUser(locale = 'en') {
  return {
    id: 0,
    username: locale === 'fr' ? 'Invité' : 'Guest',
    email: 'guest@demo.invalid',
    role: 'guest',
    avatar: 4,
    locale,
    passwordHash: null,
    googleId: null,
    tokenVersion: 0,
    isGuest: true,
    createdAt: new Date(),
  };
}

/** Decodes the session cookie (if any) into `req.session`. Never rejects the request. */
export function readSession(req, _res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
      if (payload.typ === 'guest') req.session = { guest: true, locale: payload.l === 'fr' ? 'fr' : 'en' };
      else if (payload.typ === 'session') req.session = { userId: Number(payload.sub), version: payload.v ?? 0 };
      else req.session = null; // e.g. a password-reset token is never a session
    } catch {
      req.session = null;
    }
  }
  next();
}

/** Loads the current user (or the virtual guest). Token version must match: logout-everywhere support. */
export async function loadUser(req) {
  if (req.user !== undefined) return req.user;
  req.user = null;
  if (req.session?.guest) {
    req.user = guestUser(req.session.locale);
  } else if (req.session?.userId) {
    const user = await User.findByPk(req.session.userId);
    if (user && user.tokenVersion === req.session.version) req.user = user;
  }
  return req.user;
}

/** Any signed-in reader, guests included (they get demo data). */
export async function requireAuth(req, res, next) {
  const user = await loadUser(req);
  if (!user) {
    if (req.session) clearSessionCookie(res);
    throw new HttpError(401, 'unauthorized');
  }
  next();
}

/** Real accounts only: every state-changing route is closed to the demo session. */
export async function forbidGuest(req, _res, next) {
  const user = await loadUser(req);
  if (user?.isGuest) throw new HttpError(403, 'guest_readonly');
  next();
}

/** Editors; the guest may *read* the desk (demo data) but never change anything. */
export async function requireAdmin(req, _res, next) {
  const user = await loadUser(req);
  if (!user) throw new HttpError(401, 'unauthorized');
  if (user.isGuest) {
    if (req.method === 'GET') return next();
    throw new HttpError(403, 'guest_readonly');
  }
  if (user.role !== 'admin') throw new HttpError(403, 'forbidden');
  next();
}
