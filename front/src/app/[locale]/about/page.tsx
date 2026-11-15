import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { JsonLd } from '@/components/ui/JsonLd';
import { Longform } from '@/components/ui/Longform';
import type { AppLocale } from '@/i18n/routing';
import { absoluteUrl, pageMetadata } from '@/lib/seo';
import { AUTHOR_URL, REPO_URL } from '@/lib/site';

type Props = { params: Promise<{ locale: AppLocale }> };

const SECTIONS = ['what', 'data', 'rhythm', 'privacy', 'history', 'stack', 'disclaimer'] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, href: '/about', title: t('aboutTitle'), description: t('aboutDescription') });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('about');

  const sections = SECTIONS.map((key) => ({
    id: key,
    title: t(`${key}Title`),
    body: (
      <p>
        {t(key)}
        {key === 'history' && (
          <>
            {' '}
            <a href={AUTHOR_URL}>mbonnici.fr</a> · <a href={REPO_URL}>GitHub</a>
          </>
        )}
      </p>
    ),
  }));

  return (
    <>
      <Longform kicker={t('kicker')} title={t('title')} deck={t('deck')} sections={sections} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: t('title'),
          url: absoluteUrl(locale, '/about'),
          inLanguage: locale,
          description: t('what'),
        }}
      />
    </>
  );
}
