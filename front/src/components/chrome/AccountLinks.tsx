'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useSession } from '../providers/SessionProvider';

export function AccountLinks() {
  const t = useTranslations('header');
  const { user } = useSession();

  if (!user) {
    return (
      <>
        <Link href="/login" className="tool-link tool-link--boxed">
          {t('login')}
        </Link>
        <Link href="/register" className="tool-link tool-link--solid">
          {t('subscribe')}
        </Link>
      </>
    );
  }

  // The demo session can browse the editor's desk (read-only, fictional data).
  const canSeeDesk = user.role === 'admin' || user.isGuest;
  return (
    <>
      {canSeeDesk && (
        <Link href="/admin" className="tool-link tool-link--desk">
          {t('admin')}
        </Link>
      )}
      <Link
        href="/account"
        className={`account-chip${user.isGuest ? ' account-chip--guest' : ''}`}
        aria-label={user.isGuest ? t('guestAccount') : t('account', { username: user.username })}
      >
        <img src={`/avatars/user${user.avatar}.svg`} alt="" width={30} height={30} />
        <span aria-hidden="true">{user.username}</span>
      </Link>
    </>
  );
}
