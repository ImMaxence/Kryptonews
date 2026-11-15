import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SWRConfig } from 'swr';
import { Clippings } from '@/components/favorites/Clippings';
import { PageHead } from '@/components/ui/PageHead';
import { getPathname, redirect } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { getFavorites, getSession } from '@/lib/server-api';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, href: '/favorites', title: t('favoritesTitle'), description: t('siteDescription'), noindex: true });
}

export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  const user = await getSession();
  if (!user) {
    redirect({ href: { pathname: '/login', query: { next: getPathname({ locale, href: '/favorites' }) } }, locale });
  }
  const [t, favorites] = await Promise.all([getTranslations('favorites'), user?.isGuest ? Promise.resolve([]) : getFavorites()]);

  return (
    <div className="wrap page">
      <PageHead kicker={t('kicker')} title={t('title')} deck={t('deck')} />
      {/* Guests read their scrapbook from localStorage, so no server snapshot for them. */}
      <SWRConfig value={{ fallback: user?.isGuest ? {} : { '/api/favorites': { items: favorites } } }}>
        <Clippings />
      </SWRConfig>
    </div>
  );
}
