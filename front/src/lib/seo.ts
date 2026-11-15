import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { type AppLocale, routing } from '@/i18n/routing';
import { SITE_NAME, siteUrl } from './site';

type Href = Parameters<typeof getPathname>[0]['href'];

export const absoluteUrl = (locale: AppLocale, href: Href) => `${siteUrl()}${getPathname({ locale, href })}`;

/** hreflang map for a route: one entry per locale + x-default (English). */
export function languageAlternates(href: Href) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) languages[locale] = absoluteUrl(locale, href);
  languages['x-default'] = absoluteUrl(routing.defaultLocale, href);
  return languages;
}

export function pageMetadata({
  locale,
  href,
  title,
  description,
  noindex = false,
  ogType = 'website',
  absoluteTitle = false,
}: {
  locale: AppLocale;
  href: Href;
  title: string;
  description: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  /** Skip the "· Kryptonews" title template (for titles that already contain the brand). */
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(locale, href);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(href),
      types: { 'text/plain': `${siteUrl()}/llms.txt` },
    },
    openGraph: {
      type: ogType,
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? ['en_US'] : ['fr_FR'],
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large' },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
