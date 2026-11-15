import type { Metadata } from 'next';
import { LegalDocument, legalMetadata } from '@/content/legal-page';
import type { AppLocale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return legalMetadata('terms', (await params).locale);
}

export default async function TermsPage({ params }: Props) {
  return <LegalDocument page="terms" locale={(await params).locale} />;
}
