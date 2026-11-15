import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { GuestButton } from '../auth/GuestButton';
import { ScissorsIcon } from '../Icons';

/** "Free edition" coupon shown under limited lists for visitors without an account. */
export function GuestWall({ message }: { message: string }) {
  const t = useTranslations('guestWall');
  const tAuth = useTranslations('auth');
  return (
    <aside className="coupon guest-wall" aria-labelledby="guest-wall-title">
      <span className="coupon__scissors">
        <ScissorsIcon />
        {tAuth('coupon')}
      </span>
      <h2 id="guest-wall-title" className="coupon__title">
        {t('title')}
      </h2>
      <p className="coupon__body">{message}</p>
      <div className="coupon__actions">
        <Link href="/register" className="btn btn--solid">
          {t('cta')}
        </Link>
        <Link href="/login" className="btn">
          {t('login')}
        </Link>
        <GuestButton className="btn btn--dashed" />
      </div>
    </aside>
  );
}
