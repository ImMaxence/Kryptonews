'use client';

import { useTranslations } from 'next-intl';
import { useRouter as useNextRouter } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { send } from '@/lib/client-api';
import { useSession } from '../providers/SessionProvider';

/** Persistent notice while the demo session is active, with a way out. */
export function GuestBanner() {
  const t = useTranslations('guestMode');
  const { user, setUser } = useSession();
  const router = useRouter();
  const nextRouter = useNextRouter();
  if (!user?.isGuest) return null;

  const exit = async () => {
    await send('/api/auth/logout').catch(() => undefined);
    setUser(null);
    router.push('/');
    nextRouter.refresh();
  };

  return (
    <aside className="guest-banner" aria-label={t('label')}>
      <div className="wrap guest-banner__inner">
        <p>
          <span className="stamp guest-banner__stamp" aria-hidden="true">
            {t('label')}
          </span>
          {t('banner')}
        </p>
        <div className="guest-banner__actions">
          <Link href="/register" className="btn btn--small btn--accent">
            {t('cta')}
          </Link>
          <button type="button" className="btn btn--small" onClick={exit}>
            {t('exit')}
          </button>
        </div>
      </div>
    </aside>
  );
}
