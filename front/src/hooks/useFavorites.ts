'use client';

import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useSession } from '@/components/providers/SessionProvider';
import { fetcher, send } from '@/lib/client-api';
import { readGuestStore, writeGuestStore } from '@/lib/guest-store';
import type { CoinList, Favorite } from '@/lib/types';

const KEY = '/api/favorites';

/**
 * Guest mode: start from the demo scrapbook served by the API, then keep the
 * visitor's own list in localStorage. Watched coins get fresh prices on load.
 */
async function guestFetcher(): Promise<{ items: Favorite[] }> {
  const local = readGuestStore().favorites;
  if (!local) return fetcher<{ items: Favorite[] }>(KEY);
  if (!local.some((f) => f.kind === 'crypto')) return { items: local };
  try {
    const { items: coins } = await fetcher<CoinList>('/api/cryptos');
    const byId = new Map(coins.map((c) => [c.id, c]));
    return {
      items: local.map((f) => {
        const coin = f.kind === 'crypto' ? byId.get(f.refId) : undefined;
        return coin ? { ...f, coin: { id: coin.id, symbol: coin.symbol, name: coin.name, price: coin.price, change24h: coin.change24h } } : f;
      }),
    };
  } catch {
    return { items: local };
  }
}

/** Shared favorites cache: every save button reads the same SWR entry (one request per page). */
export function useFavorites() {
  const { user } = useSession();
  const guest = Boolean(user?.isGuest);
  const { data, mutate, isLoading } = useSWR<{ items: Favorite[] }>(user ? KEY : null, guest ? guestFetcher : fetcher, {
    revalidateOnFocus: false,
  });

  const items = useMemo(() => data?.items ?? [], [data]);
  const index = useMemo(() => new Map(items.map((f) => [`${f.kind}:${f.refId}`, f])), [items]);

  const find = useCallback((kind: Favorite['kind'], refId: string | number) => index.get(`${kind}:${refId}`), [index]);

  const saveLocal = useCallback((next: { items: Favorite[] }) => {
    writeGuestStore({ favorites: next.items });
    return next;
  }, []);

  const add = useCallback(
    async (kind: Favorite['kind'], refId: string | number, title = String(refId), extra: Partial<Favorite> = {}) => {
      if (guest) {
        const item: Favorite = {
          id: -Date.now(),
          kind,
          refId: String(refId),
          title,
          url: null,
          image: kind === 'crypto' ? `/api/media/coin/${encodeURIComponent(String(refId))}?size=small` : null,
          source: null,
          createdAt: new Date().toISOString(),
          coin: null,
          ...extra,
        };
        await mutate((current) => saveLocal({ items: [item, ...(current?.items ?? [])] }), { revalidate: false });
        return item;
      }
      const { item } = await send<{ item: Favorite }>(KEY, { body: { kind, refId: String(refId) } });
      await mutate((current) => ({ items: [item, ...(current?.items ?? []).filter((f) => f.id !== item.id)] }), {
        revalidate: false,
      });
      return item;
    },
    [mutate, guest, saveLocal],
  );

  const remove = useCallback(
    async (id: number) => {
      const without = (current?: { items: Favorite[] }) => ({ items: (current?.items ?? []).filter((f) => f.id !== id) });
      if (guest) {
        await mutate((current) => saveLocal(without(current)), { revalidate: false });
        return;
      }
      await mutate(
        async (current) => {
          await send(`${KEY}/${id}`, { method: 'DELETE' });
          return without(current);
        },
        { optimisticData: without, rollbackOnError: true, revalidate: false },
      );
    },
    [mutate, guest, saveLocal],
  );

  return { items, find, add, remove, isLoading, enabled: Boolean(user), guest };
}
