import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { ArticlePage, Coin, CoinList, Favorite, Rate, SiteConfig, Source, TickerItem, User } from './types';

const API = (process.env.API_INTERNAL_URL || 'http://localhost:8080').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

/** Server-side call to the API, forwarding the visitor's session cookie. */
export async function api<T>(path: string, { auth = true }: { auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (auth) {
    const session = (await cookies()).get('kn_session');
    if (session) headers.cookie = `kn_session=${session.value}`;
  }
  const res = await fetch(`${API}/api${path}`, { headers, cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || 'server_error');
  }
  return res.json() as Promise<T>;
}

/** Same as `api` but returns `null` instead of throwing, so pages degrade gracefully. */
export async function tryApi<T>(path: string, options?: { auth?: boolean }): Promise<T | null> {
  try {
    return await api<T>(path, options);
  } catch {
    return null;
  }
}

export const getSession = cache(async (): Promise<User | null> => {
  const session = (await cookies()).get('kn_session');
  if (!session) return null;
  const data = await tryApi<{ user: User }>('/auth/me');
  return data?.user ?? null;
});

export const getSiteConfig = cache(() => tryApi<SiteConfig>('/config', { auth: false }));
export const getTicker = cache(() => tryApi<{ items: TickerItem[] }>('/cryptos/ticker', { auth: false }));
export const getRates = cache(async () => (await tryApi<{ items: Rate[] }>('/rates', { auth: false }))?.items ?? []);
export const getCoins = cache(() => tryApi<CoinList>('/cryptos'));
/** null only when the coin does not exist: any other failure throws (error page, 5xx), so search engines retry instead of dropping the page. */
export const getCoin = cache(async (id: string) => {
  try {
    return await api<{ item: Coin }>(`/cryptos/${encodeURIComponent(id)}`, { auth: false });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});
export const getSources = cache(async () => (await tryApi<{ items: Source[] }>('/articles/sources', { auth: false }))?.items ?? []);
export const getFavorites = cache(async () => (await tryApi<{ items: Favorite[] }>('/favorites'))?.items ?? []);

export function getArticles(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  return tryApi<ArticlePage>(`/articles?${search.toString()}`);
}

/** Preferred display currency: cookie set by the currency selector, else locale default. */
export async function getCurrencyPreference(locale: string) {
  const value = (await cookies()).get('kn_currency')?.value;
  return value && /^[a-z]{3}$/.test(value) ? value : locale === 'fr' ? 'eur' : 'usd';
}
