import pkg from '../../package.json';

/** Public base URL, read at runtime on the server (set by Docker / Coolify). */
export const siteUrl = () => (process.env.PUBLIC_URL || 'https://kryptonews.mbonnici.fr').replace(/\/+$/, '');

export const VERSION = pkg.version;
export const SITE_NAME = 'Kryptonews';
export const REPO_URL = 'https://github.com/ImMaxence/Kryptonews';
export const AUTHOR_URL = 'https://mbonnici.fr';
export const CONTACT_URL = 'https://mbonnici.fr/fr/contact';
export const COINGECKO_URL = 'https://www.coingecko.com';

/** Optional contact address shown on the legal pages (runtime env, never committed). */
export const contactEmail = () => process.env.CONTACT_EMAIL?.trim() || null;

export const LEGAL_UPDATED_AT = '2026-11-15';

/** Edition number printed in the masthead: days since the first edition went live. */
export function editionNumber(now = new Date()) {
  const first = Date.UTC(2023, 11, 1);
  return Math.max(1, Math.floor((now.getTime() - first) / 86_400_000));
}
