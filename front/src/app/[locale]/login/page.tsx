import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/components/forms/AuthForms';
import { ScissorsIcon } from '@/components/Icons';
import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { getSession, getSiteConfig } from '@/lib/server-api';

type Props = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, href: '/login', title: t('loginTitle'), description: t('loginDescription') });
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  // A guest (demo) session may still sign in or sign up for real.
  const [session, config] = await Promise.all([getSession(), getSiteConfig()]);
  if (session && !session.isGuest) redirect({ href: '/account', locale });
  const t = await getTranslations('auth');
  const next = typeof sp.next === 'string' ? sp.next : undefined;
  const error = typeof sp.error === 'string' ? sp.error : undefined;

  return (
    <div className="wrap page">
      <div className="auth">
        <div className="auth__pitch">
          <p className="kicker kicker--accent">{t('loginKicker')}</p>
          <h1 className="auth__title">{t('loginTitle')}</h1>
          <p className="page-head__deck">{t('loginDeck')}</p>
        </div>
        <div className="coupon">
          <span className="coupon__scissors" aria-hidden="true">
            <ScissorsIcon />
            {t('coupon')}
          </span>
          <LoginForm next={next} initialError={error} google={Boolean(config?.google)} />
        </div>
      </div>
    </div>
  );
}
