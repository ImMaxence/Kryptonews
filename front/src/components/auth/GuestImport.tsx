'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useSWRConfig } from 'swr';
import { send } from '@/lib/client-api';
import { clearGuestStore, readGuestStore } from '@/lib/guest-store';
import { useSession } from '../providers/SessionProvider';
import { useToast } from '../providers/ToastProvider';

/**
 * When a real account signs in (password or Google) on a device that has
 * a guest scrapbook, its clippings and watched coins are imported, then erased locally.
 */
export function GuestImport() {
  const t = useTranslations('guestMode');
  const toast = useToast();
  const { mutate } = useSWRConfig();
  const { user } = useSession();

  useEffect(() => {
    if (!user || user.isGuest) return;
    const { favorites } = readGuestStore();
    if (!favorites?.length) return;
    // Clear first so another tab or a re-render cannot import twice.
    clearGuestStore();
    void (async () => {
      let imported = 0;
      for (const favorite of favorites) {
        try {
          await send('/api/favorites', { body: { kind: favorite.kind, refId: favorite.refId } });
          imported += 1;
        } catch {
          // Expired headline or unknown coin: skip it.
        }
      }
      if (imported) {
        await mutate('/api/favorites');
        toast(t('imported', { count: imported }));
      }
    })();
  }, [user, mutate, toast, t]);

  return null;
}
