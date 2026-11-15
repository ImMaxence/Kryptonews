import type { Favorite } from './types';

/**
 * Guest mode keeps what the visitor does in this browser only (localStorage):
 * clippings, watched coins and a demo portrait. Nothing reaches the server, and
 * everything is imported into a real account at sign-up.
 */
const KEY = 'kn-guest-v1';

export interface GuestStore {
  favorites: Favorite[] | null;
  profile: { username?: string; avatar?: number };
}

const empty = (): GuestStore => ({ favorites: null, profile: {} });

export function readGuestStore(): GuestStore {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<GuestStore>;
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites.slice(0, 500) : null,
      profile: parsed.profile && typeof parsed.profile === 'object' ? parsed.profile : {},
    };
  } catch {
    return empty();
  }
}

export function writeGuestStore(patch: Partial<GuestStore>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...readGuestStore(), ...patch }));
  } catch {
    // Private mode or storage disabled: guest changes simply stay in memory.
  }
}

export function clearGuestStore() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Ignore: nothing to clear.
  }
}
