import type { Metadata } from 'next';
import { LegalDocument, legalMetadata } from '@/content/legal-page';
import type { AppLocale } from '@/i18n/routing';

type Props = { params: Promise<{ locale: AppLocale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return legalMetadata('privacy', (await params).locale);
}

export default async function PrivacyPage({ params }: Props) {
  return <LegalDocument page="privacy" locale={(await params).locale} />;
}
