import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ForgotPassword, ResetPasswordForm } from '@/components/forms/ResetForms';
import { ScissorsIcon } from '@/components/Icons';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    ...pageMetadata({ locale, href: '/reset-password', title: t('resetTitle'), description: t('loginDescription'), noindex: true }),
    // The token must never leak to other sites through the Referer header.
    referrer: 'no-referrer',
  };
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const sp = await searchParams;
  const token = typeof sp.token === 'string' && sp.token.length < 1000 ? sp.token : null;
  const [t, tAuth] = await Promise.all([getTranslations('reset'), getTranslations('auth')]);

  return (
    <div className="wrap page">
      <div className="auth">
        <div className="auth__pitch">
          <p className="kicker kicker--accent">{t('kicker')}</p>
          <h1 className="auth__title">{token ? t('setTitle') : t('forgotTitle')}</h1>
        </div>
        <div className="coupon">
          <span className="coupon__scissors" aria-hidden="true">
            <ScissorsIcon />
            {tAuth('coupon')}
          </span>
          {token ? <ResetPasswordForm token={token} /> : <ForgotPassword />}
        </div>
      </div>
    </div>
  );
}
