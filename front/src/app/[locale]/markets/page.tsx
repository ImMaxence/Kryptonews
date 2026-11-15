import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MarketsTable } from '@/components/markets/MarketsTable';
import { JsonLd } from '@/components/ui/JsonLd';
import { PageHead } from '@/components/ui/PageHead';
import { TimeAgo } from '@/components/ui/TimeAgo';
import type { AppLocale } from '@/i18n/routing';
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from '@/lib/seo';
import { getCoins } from '@/lib/server-api';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, href: '/markets', title: t('marketsTitle'), description: t('marketsDescription') });
}

export default async function MarketsPage({ params }: Props) {
  const { locale } = await params;
  const [t, tNav, tCommon, coins] = await Promise.all([
    getTranslations('markets'),
    getTranslations('nav'),
    getTranslations('common'),
    getCoins(),
  ]);

  const jsonLd = [
    breadcrumbJsonLd([
      { name: tNav('home'), url: absoluteUrl(locale, '/') },
      { name: tNav('markets'), url: absoluteUrl(locale, '/markets') },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: t('title'),
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: coins?.items.length ?? 0,
      itemListElement: (coins?.items ?? []).map((coin, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${coin.name} (${coin.symbol})`,
        url: absoluteUrl(locale, { pathname: '/markets/[id]', params: { id: coin.id } }),
      })),
    },
  ];

  return (
    <div className="wrap page">
      <PageHead kicker={t('kicker')} title={t('title')} deck={t('deck')}>
        {coins?.updatedAt && <TimeAgo value={coins.updatedAt} template={tCommon.raw('updated') as string} />}
      </PageHead>
      {coins && coins.items.length ? <MarketsTable initial={coins} /> : <p className="empty-state">{t('empty')}</p>}
      <JsonLd data={jsonLd} />
    </div>
  );
}
