import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AccessRequestForm } from '@/components/forms/AuthForms';
import { ScissorsIcon } from '@/components/Icons';
import { redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { getSession } from '@/lib/server-api';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, href: '/register', title: t('registerTitle'), description: t('registerDescription') });
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  // A guest (demo) session may still sign in or sign up for real.
  const session = await getSession();
  if (session && !session.isGuest) redirect({ href: '/account', locale });
  const t = await getTranslations('auth');

  return (
    <div className="wrap page">
      <div className="auth">
        <div className="auth__pitch">
          <p className="kicker kicker--accent">{t('registerKicker')}</p>
          <h1 className="auth__title">{t('registerTitle')}</h1>
          <p className="page-head__deck">{t('registerDeck')}</p>
          <ul className="auth__benefits">
            <li>{t('benefit1')}</li>
            <li>{t('benefit2')}</li>
            <li>{t('benefit3')}</li>
          </ul>
          <p aria-hidden="true">
            <span className="stamp">0 €</span>
          </p>
        </div>
        <div className="coupon">
          <span className="coupon__scissors" aria-hidden="true">
            <ScissorsIcon />
            {t('coupon')}
          </span>
          <AccessRequestForm />
        </div>
      </div>
    </div>
  );
}
