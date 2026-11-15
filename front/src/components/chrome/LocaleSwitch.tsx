'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link, usePathname } from '@/i18n/navigation';

export function LocaleSwitch() {
  const t = useTranslations('header');
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const target = locale === 'fr' ? 'en' : 'fr';

  const { locale: _ignored, ...routeParams } = params as Record<string, string>;
  const href = { pathname, params: routeParams } as Parameters<typeof Link>[0]['href'];

  return (
    <Link href={href} locale={target} className="tool-link tool-link--boxed" hrefLang={target} lang={target} prefetch={false}>
      <span aria-hidden="true">{t('switchLanguageShort')}</span>
      <span className="sr-only">{t('switchLanguage')}</span>
    </Link>
  );
}
