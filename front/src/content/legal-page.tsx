import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Longform } from '@/components/ui/Longform';
import { getPathname } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { formatDate } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';
import { contactEmail, LEGAL_UPDATED_AT, siteUrl } from '@/lib/site';
import { getLegalSections, type LegalPage } from './legal';

const META = {
  'legal-notice': { title: 'legalNoticeTitle', description: 'legalNoticeDescription' },
  privacy: { title: 'privacyTitle', description: 'privacyDescription' },
  terms: { title: 'termsTitle', description: 'termsDescription' },
  accessibility: { title: 'accessibilityTitle', description: 'accessibilityDescription' },
} as const;

const HREF = {
  'legal-notice': '/legal-notice',
  privacy: '/privacy',
  terms: '/terms',
  accessibility: '/accessibility',
} as const;

export async function legalMetadata(page: LegalPage, locale: AppLocale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, href: HREF[page], title: t(META[page].title), description: t(META[page].description) });
}

export async function LegalDocument({ page, locale }: { page: LegalPage; locale: AppLocale }) {
  const [t, tLegal] = await Promise.all([getTranslations({ locale, namespace: 'meta' }), getTranslations({ locale, namespace: 'legal' })]);
  const sections = getLegalSections(page, {
    locale,
    siteUrl: siteUrl(),
    email: contactEmail(),
    links: {
      privacy: getPathname({ locale, href: '/privacy' }),
      terms: getPathname({ locale, href: '/terms' }),
      account: getPathname({ locale, href: '/account' }),
      legalNotice: getPathname({ locale, href: '/legal-notice' }),
    },
  });
  return (
    <Longform
      kicker={tLegal('kicker')}
      title={t(META[page].title)}
      sections={sections}
      updated={formatDate(LEGAL_UPDATED_AT, locale, { dateStyle: 'long' })}
    />
  );
}
