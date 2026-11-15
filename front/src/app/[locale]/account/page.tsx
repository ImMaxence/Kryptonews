import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AccountPanel } from '@/components/account/AccountPanel';
import { PageHead } from '@/components/ui/PageHead';
import { getPathname, redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { getSession } from '@/lib/server-api';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, href: '/account', title: t('accountTitle'), description: t('siteDescription'), noindex: true });
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  const user = await getSession();
  if (!user) {
    redirect({ href: { pathname: '/login', query: { next: getPathname({ locale, href: '/account' }) } }, locale });
  }
  const t = await getTranslations('account');

  return (
    <div className="wrap page">
      <PageHead kicker={t('kicker')} title={t('title')} />
      <AccountPanel />
    </div>
  );
}
