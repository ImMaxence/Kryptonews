import { Setting } from '../db.js';

export const DEFAULT_SETTINGS = Object.freeze({
  // How many rows a visitor without an account sees (0 = no limit).
  guestCryptoLimit: 20,
  guestNewsLimit: 12,
  // Kill switch for access requests (logins keep working).
  signupsOpen: true,
});

let cache = null;

export async function getSettings() {
  if (cache) return cache;
  const rows = await Setting.findAll();
  // Only public, known settings: other rows (e.g. VAPID keys) must never be exposed.
  const stored = Object.fromEntries(rows.filter((row) => row.key in DEFAULT_SETTINGS).map((row) => [row.key, row.value]));
  cache = { ...DEFAULT_SETTINGS, ...stored };
  return cache;
}

export async function updateSettings(patch) {
  for (const [key, value] of Object.entries(patch)) {
    // Unknown keys and absent fields are ignored (a partial form must not erase a setting).
    if (!(key in DEFAULT_SETTINGS) || value === undefined) continue;
    await Setting.upsert({ key, value });
  }
  cache = null;
  return getSettings();
}

/** Runtime status of the background jobs, exposed on /api/health and the admin desk. */
export const syncState = {
  markets: { lastSuccess: null, lastError: null },
  rates: { lastSuccess: null, lastError: null },
  news: { lastSuccess: null, lastError: null },
};
