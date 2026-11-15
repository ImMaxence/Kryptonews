import { createHash } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../db.js';

/**
 * Editor-assisted password reset: an editor generates a one-hour link and sends it
 * to the account's email address. The token embeds a fingerprint of the current
 * password hash and token version, so it stops working as soon as it has been used
 * (or the password changed some other way). No database table, no email server.
 */
export const RESET_TTL_MINUTES = 60;

const fingerprint = (user) =>
  createHash('sha256').update(`${user.passwordHash ?? 'none'}:${user.tokenVersion}`).digest('base64url').slice(0, 22);

export function createResetToken(user) {
  return jwt.sign({ typ: 'reset', fp: fingerprint(user) }, config.jwtSecret, {
    algorithm: 'HS256',
    subject: String(user.id),
    expiresIn: `${RESET_TTL_MINUTES}m`,
  });
}

/** Returns the reader the token belongs to, or null if it is invalid, expired or already used. */
export async function userFromResetToken(token) {
  try {
    const payload = jwt.verify(String(token), config.jwtSecret, { algorithms: ['HS256'] });
    if (payload.typ !== 'reset') return null;
    const user = await User.findByPk(Number(payload.sub));
    // Editors sign in with Google only: never through a reset link.
    if (!user || user.role === 'admin' || fingerprint(user) !== payload.fp) return null;
    return user;
  } catch {
    return null;
  }
}
