import type { Metadata } from 'next';
import { LegalDocument, legalMetadata } from '@/content/legal-page';
import type { AppLocale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return legalMetadata('accessibility', (await params).locale);
}

export default async function AccessibilityPage({ params }: Props) {
  return <LegalDocument page="accessibility" locale={(await params).locale} />;
}
