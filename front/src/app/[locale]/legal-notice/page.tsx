import type { Metadata } from 'next';
import { LegalDocument, legalMetadata } from '@/content/legal-page';
import type { AppLocale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return legalMetadata('legal-notice', (await params).locale);
}

export default async function LegalNoticePage({ params }: Props) {
  return <LegalDocument page="legal-notice" locale={(await params).locale} />;
}
