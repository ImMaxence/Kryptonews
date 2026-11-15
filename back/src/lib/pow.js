import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';
import { TtlCache } from './cache.js';

/**
 * Self-hosted proof of work for sign-ups (no third-party CAPTCHA): the browser must find
 * a nonce such that SHA-256(salt + nonce) starts with `bits` zero bits (~65k hashes at
 * 16 bits, a second or two on a phone). Challenges are HMAC-signed, expire after
 * 10 minutes and can only be used once.
 */
const TTL_MS = 10 * 60_000;
const used = new TtlCache({ maxEntries: 50_000 });

const sign = (payload) => createHmac('sha256', `pow:${config.jwtSecret}`).update(payload).digest('hex');

export function createChallenge() {
  const salt = randomBytes(16).toString('hex');
  const bits = config.signup.powBits;
  const expires = Date.now() + TTL_MS;
  return { salt, bits, expires, signature: sign(`${salt}.${bits}.${expires}`) };
}

export function hasLeadingZeroBits(buffer, bits) {
  const full = Math.floor(bits / 8);
  for (let i = 0; i < full; i += 1) if (buffer[i] !== 0) return false;
  const rest = bits % 8;
  return rest === 0 || buffer[full] >> (8 - rest) === 0;
}

export function verifySolution(solution) {
  if (!solution || typeof solution !== 'object') return false;
  const { salt, bits, expires, signature, nonce } = solution;
  if (typeof salt !== 'string' || typeof signature !== 'string' || typeof nonce !== 'string') return false;
  if (!Number.isInteger(bits) || !Number.isInteger(expires) || nonce.length > 32) return false;
  if (bits < config.signup.powBits || Date.now() > expires) return false;

  const expected = Buffer.from(sign(`${salt}.${bits}.${expires}`), 'hex');
  const given = Buffer.from(signature.padEnd(64, '0').slice(0, 64), 'hex');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  if (used.peek(salt)) return false; // replay

  const hash = createHash('sha256').update(`${salt}${nonce}`).digest();
  if (!hasLeadingZeroBits(hash, bits)) return false;
  used.set(salt, true, TTL_MS);
  return true;
}
