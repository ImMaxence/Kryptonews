import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';

const env = process.env;

const bool = (value, fallback) => {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const int = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

/** "a@x.com, B@y.com ,," -> ['a@x.com', 'b@y.com'] */
export const parseEmailList = (value) =>
  [...new Set(String(value || '').split(',').map((email) => email.trim().toLowerCase()).filter((email) => email.includes('@')))];

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const isProd = env.NODE_ENV === 'production';
const publicUrl = (env.PUBLIC_URL || 'http://localhost:3000').replace(/\/+$/, '');

let jwtSecret = env.JWT_SECRET || '';
if (jwtSecret.length < 32) {
  if (isProd) {
    throw new Error('JWT_SECRET must be set to at least 32 characters in production.');
  }
  jwtSecret = randomBytes(48).toString('hex');
  console.warn('[config] JWT_SECRET missing: using an ephemeral secret, sessions reset on restart.');
}

export const config = Object.freeze({
  version: pkg.version,
  isProd,
  port: int(env.PORT, 8080),
  publicUrl,
  publicOrigin: new URL(publicUrl).origin,
  cookieSecure: bool(env.COOKIE_SECURE, publicUrl.startsWith('https://')),
  trustCloudflare: bool(env.TRUST_CLOUDFLARE, true),
  jwtSecret,
  sessionTtlDays: int(env.SESSION_TTL_DAYS, 7),
  db: {
    host: env.DB_HOST || 'db',
    port: int(env.DB_PORT, 3306),
    name: env.DB_NAME || 'kryptonews',
    user: env.DB_USER || 'kryptonews',
    password: env.DB_PASSWORD || '',
    alter: bool(env.DB_SYNC_ALTER, false),
  },
  coingecko: {
    apiKey: env.COINGECKO_API_KEY || '',
    pro: bool(env.COINGECKO_PRO, false),
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID || '',
    clientSecret: env.GOOGLE_CLIENT_SECRET || '',
  },
  admin: {
    username: (env.ADMIN_USERNAME || 'admin').trim(),
    email: (env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: env.ADMIN_PASSWORD || '',
    // Editors sign in with Google; only these (verified) addresses are accepted.
    googleEmails: parseEmailList(env.ADMIN_EMAILS),
  },
  guestSessionHours: int(env.GUEST_SESSION_HOURS, 24),
  // Anti-abuse for access requests: global caps (all IPs together), pending queue size,
  // retention of unanswered requests and proof-of-work difficulty.
  signup: {
    maxPerHour: int(env.SIGNUP_MAX_PER_HOUR, 30),
    maxPerDay: int(env.SIGNUP_MAX_PER_DAY, 200),
    maxPending: int(env.MAX_PENDING_REQUESTS, 100),
    pendingDays: int(env.PENDING_REQUEST_DAYS, 30),
    maxAccounts: int(env.MAX_ACCOUNTS, 5000),
    powBits: Math.min(24, Math.max(8, int(env.SIGNUP_POW_BITS, 16))),
  },
  vapid: {
    publicKey: env.VAPID_PUBLIC_KEY || '',
    privateKey: env.VAPID_PRIVATE_KEY || '',
    // Push services require a contact for the sender: an email or the site URL.
    // Must be mailto: or https: (push services reject anything else).
    subject: env.CONTACT_EMAIL ? `mailto:${env.CONTACT_EMAIL.trim()}` : publicUrl.startsWith('https://') ? publicUrl : 'mailto:push@kryptonews.invalid',
  },
  intervals: {
    marketsMs: Math.max(60, int(env.MARKETS_INTERVAL_SECONDS, 120)) * 1000,
    ratesMs: 30 * 60 * 1000,
    newsMs: Math.max(5, int(env.NEWS_INTERVAL_MINUTES, 10)) * 60 * 1000,
    housekeepingMs: 24 * 60 * 60 * 1000,
  },
  articleRetentionDays: int(env.ARTICLE_RETENTION_DAYS, 45),
  inactiveAccountYears: int(env.INACTIVE_ACCOUNT_YEARS, 3),
  // Standard crawler format: identifies the bot and links back to the site.
  userAgent: `Mozilla/5.0 (compatible; Kryptonews/${pkg.version}; +${publicUrl})`,
});

export const googleEnabled = () => Boolean(config.google.clientId && config.google.clientSecret);
