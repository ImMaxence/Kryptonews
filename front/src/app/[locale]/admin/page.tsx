import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AdminDesk } from '@/components/admin/AdminDesk';
import { EditorEntrance } from '@/components/admin/EditorEntrance';
import { PageHead } from '@/components/ui/PageHead';
import type { AppLocale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { getSession, getSiteConfig, tryApi } from '@/lib/server-api';
import type { AccessRequest, AdminFeed, AdminOverview, AdminUser } from '@/lib/types';

type Props = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, href: '/admin', title: t('adminTitle'), description: t('siteDescription'), noindex: true });
}

export default async function AdminPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [user, config] = await Promise.all([getSession(), getSiteConfig()]);

  // Editors, or the read-only demo session (the API serves it fictional data).
  // Everyone else gets the Google-only editor's entrance.
  if (!user || (user.role !== 'admin' && !user.isGuest)) {
    return <EditorEntrance googleEnabled={Boolean(config?.google)} error={typeof sp.error === 'string' ? sp.error : undefined} reader={Boolean(user)} />;
  }

  const [t, overview, feeds, users, requests] = await Promise.all([
    getTranslations('admin'),
    tryApi<AdminOverview>('/admin/overview'),
    tryApi<{ items: AdminFeed[] }>('/admin/feeds'),
    tryApi<{ items: AdminUser[] }>('/admin/users'),
    tryApi<{ items: AccessRequest[] }>('/admin/requests'),
  ]);
  if (!overview) notFound();

  return (
    <div className="wrap page">
      <PageHead kicker={t('kicker')} title={t('title')} deck={t('deck')} />
      <AdminDesk overview={overview} feeds={feeds?.items ?? []} users={users?.items ?? []} requests={requests?.items ?? []} />
    </div>
  );
}
