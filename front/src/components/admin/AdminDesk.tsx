'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import useSWR from 'swr';
import { useErrorText, useFieldText } from '@/hooks/useErrorText';
import { ApiError, fetcher, send } from '@/lib/client-api';
import { formatDate, formatNumber } from '@/lib/format';
import type { AccessRequest, AdminFeed, AdminOverview, AdminUser, SyncStatus } from '@/lib/types';
import { AccessRequests } from './AccessRequests';
import { RefreshIcon, TrashIcon } from '../Icons';
import { useSession } from '../providers/SessionProvider';
import { useToast } from '../providers/ToastProvider';
import { Field, FormAlert, describedBy } from '../forms/Field';
import { Dialog } from '../ui/Dialog';
import { TimeAgo } from '../ui/TimeAgo';

interface Props {
  overview: AdminOverview;
  feeds: AdminFeed[];
  users: AdminUser[];
  requests: AccessRequest[];
}

function Presses({ sync, onRun, retentionDays }: { sync: AdminOverview['sync']; onRun: (job: string) => Promise<void>; retentionDays?: number }) {
  const t = useTranslations('admin');
  const [running, setRunning] = useState<string | null>(null);
  const jobs: [keyof AdminOverview['sync'], string][] = [
    ['markets', t('markets')],
    ['news', t('news')],
    ['rates', t('rates')],
  ];
  const run = async (job: string) => {
    setRunning(job);
    await onRun(job);
    setRunning(null);
  };
  return (
    <section aria-labelledby="presses-title">
      <div className="section-head">
        <h2 id="presses-title">{t('pressesTitle')}</h2>
      </div>
      <div className="presses">
        {jobs.map(([job, label]) => {
          const status: SyncStatus = sync[job];
          return (
            <div key={job} className="press">
              <strong>{label}</strong>
              <span>{status.lastSuccess ? <TimeAgo value={status.lastSuccess} prefix={(time) => t('lastRun', { time })} /> : t('never')}</span>
              {job === 'news' && retentionDays && <span>{t('retention', { days: retentionDays })}</span>}
              {status.lastError ? <span className="badge badge--err">{status.lastError}</span> : status.lastSuccess && <span className="badge badge--ok">{t('feedOk')}</span>}
              <button type="button" className="btn btn--small" onClick={() => run(job)} disabled={running !== null} aria-busy={running === job}>
                <RefreshIcon width={14} height={14} /> {t('runNow')}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Feeds({ initial }: { initial: AdminFeed[] }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const toast = useToast();
  const errorText = useErrorText();
  const fieldText = useFieldText();
  const { data, mutate } = useSWR<{ items: AdminFeed[] }>('/api/admin/feeds', fetcher, { fallbackData: { items: initial }, revalidateOnMount: false });
  const feeds = data?.items ?? [];
  const [busy, setBusy] = useState<number | 'new' | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const replace = (item: AdminFeed) => mutate({ items: feeds.map((f) => (f.id === item.id ? item : f)) }, { revalidate: false });

  const act = async (id: number, action: () => Promise<void>) => {
    setBusy(id);
    try {
      await action();
    } catch (error) {
      toast(errorText(error));
    } finally {
      setBusy(null);
    }
  };

  const onAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy('new');
    setAlert(null);
    setErrors({});
    try {
      const { item } = await send<{ item: AdminFeed }>('/api/admin/feeds', {
        body: { name: String(data.get('name') ?? '').trim(), url: String(data.get('url') ?? '').trim(), lang: String(data.get('lang')), enabled: true },
      });
      await mutate({ items: [...feeds, item] }, { revalidate: false });
      form.reset();
      toast(t('feedAdded'));
    } catch (error) {
      if (error instanceof ApiError && error.fields) {
        setErrors(Object.fromEntries(Object.entries(error.fields).map(([f, c]) => [f, fieldText(f, c)])));
      }
      setAlert(errorText(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <div className="section-head">
        <h2 id="feeds-title">{t('feedsTitle')}</h2>
      </div>
      <div className="table-scroll" role="region" aria-labelledby="feeds-title" tabIndex={0}>
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">{t('feedName')}</th>
              <th scope="col">{t('feedLang')}</th>
              <th scope="col">{t('feedUrl')}</th>
              <th scope="col">{t('feedStatus')}</th>
              <th scope="col">{t('feedArticles')}</th>
              <th scope="col">{t('feedLastFetch')}</th>
              <th scope="col">{t('feedActive')}</th>
              <th scope="col">
                <span className="sr-only">{t('actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {feeds.map((feed) => (
              <tr key={feed.id}>
                <th scope="row">{feed.name}</th>
                <td>{feed.lang.toUpperCase()}</td>
                <td className="truncate" title={feed.url}>
                  {feed.url}
                </td>
                <td>{feed.lastError ? <span className="badge badge--err" title={feed.lastError}>{feed.lastError.slice(0, 40)}</span> : feed.lastFetchedAt ? <span className="badge badge--ok">{t('feedOk')}</span> : '—'}</td>
                <td className="mono">{formatNumber(feed.articleCount, locale)}</td>
                <td>{feed.lastFetchedAt ? <TimeAgo value={feed.lastFetchedAt} /> : '—'}</td>
                <td>
                  <input
                    type="checkbox"
                    className="switch"
                    checked={feed.enabled}
                    aria-label={t('toggleFeed', { name: feed.name })}
                    disabled={busy === feed.id}
                    onChange={(event) =>
                      act(feed.id, async () => {
                        const { item } = await send<{ item: AdminFeed }>(`/api/admin/feeds/${feed.id}`, { method: 'PATCH', body: { enabled: event.target.checked } });
                        await replace(item);
                      })
                    }
                  />
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={t('fetchNow', { name: feed.name })}
                    title={t('fetchNow', { name: feed.name })}
                    disabled={busy === feed.id}
                    aria-busy={busy === feed.id}
                    onClick={() =>
                      act(feed.id, async () => {
                        const { item } = await send<{ item: AdminFeed }>(`/api/admin/feeds/${feed.id}/refresh`);
                        await replace(item);
                      })
                    }
                  >
                    <RefreshIcon />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={t('deleteFeed', { name: feed.name })}
                    title={t('deleteFeed', { name: feed.name })}
                    disabled={busy === feed.id}
                    onClick={() => {
                      if (!window.confirm(t('deleteFeedConfirm', { name: feed.name }))) return;
                      void act(feed.id, async () => {
                        await send(`/api/admin/feeds/${feed.id}`, { method: 'DELETE' });
                        await mutate({ items: feeds.filter((f) => f.id !== feed.id) }, { revalidate: false });
                      });
                    }}
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="panel" onSubmit={onAdd} style={{ marginTop: '1.5rem' }} aria-labelledby="add-feed-title">
        <h3 id="add-feed-title" className="panel__title">
          {t('addFeedTitle')}
        </h3>
        <FormAlert message={alert} />
        <div className="inline-form">
          <Field id="feed-name" label={t('feedName')} error={errors.name}>
            <input {...describedBy('feed-name', { error: errors.name })} name="name" className="input" required minLength={2} maxLength={80} />
          </Field>
          <Field id="feed-url" label={t('feedUrl')} error={errors.url}>
            <input {...describedBy('feed-url', { error: errors.url })} name="url" type="url" className="input" required placeholder="https://…/feed" />
          </Field>
          <Field id="feed-lang" label={t('feedLang')}>
            <select id="feed-lang" name="lang" className="select" defaultValue={locale}>
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
          </Field>
          <button type="submit" className="btn btn--solid" disabled={busy === 'new'} aria-busy={busy === 'new'}>
            {t('addFeedSubmit')}
          </button>
        </div>
      </form>
    </section>
  );
}

function Limits({ settings }: { settings: AdminOverview['settings'] }) {
  const t = useTranslations('admin');
  const errorText = useErrorText();
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<{ message: string; ok: boolean } | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    try {
      await send('/api/admin/settings', {
        method: 'PUT',
        body: { guestCryptoLimit: Number(data.get('guestCryptoLimit')), guestNewsLimit: Number(data.get('guestNewsLimit')) },
      });
      setAlert({ message: t('settingsSaved'), ok: true });
    } catch (error) {
      setAlert({ message: errorText(error), ok: false });
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="panel" aria-labelledby="limits-title">
      <h2 id="limits-title" className="panel__title">
        {t('settingsTitle')}
      </h2>
      <form onSubmit={onSubmit} className="stack">
        <FormAlert message={alert?.message ?? null} ok={alert?.ok} />
        <Field id="limit-crypto" label={t('guestCrypto')} hint={t('guestHint')}>
          <input {...describedBy('limit-crypto', { hint: true })} name="guestCryptoLimit" type="number" className="input" min={0} max={100} defaultValue={settings.guestCryptoLimit} required />
        </Field>
        <Field id="limit-news" label={t('guestNews')} hint={t('guestHint')}>
          <input {...describedBy('limit-news', { hint: true })} name="guestNewsLimit" type="number" className="input" min={0} max={200} defaultValue={settings.guestNewsLimit} required />
        </Field>
        <button type="submit" className="btn btn--solid" disabled={pending} aria-busy={pending}>
          {t('saveSettings')}
        </button>
      </form>
    </section>
  );
}

function Readers({ initial }: { initial: AdminUser[] }) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const toast = useToast();
  const errorText = useErrorText();
  const { user: me } = useSession();
  const [users, setUsers] = useState(initial);
  const tReset = useTranslations('adminReset');
  const [reset, setReset] = useState<{ url: string; email: string; expiresAt: string } | null>(null);

  const createResetLink = async (user: AdminUser) => {
    try {
      setReset(await send<{ url: string; email: string; expiresAt: string }>(`/api/admin/users/${user.id}/reset-link`));
    } catch (error) {
      toast(errorText(error));
    }
  };

  const copyResetLink = async () => {
    if (!reset) return;
    try {
      await navigator.clipboard.writeText(reset.url);
      toast(tReset('copied'));
    } catch {
      // Clipboard blocked: the link stays selectable in the dialog.
    }
  };

  const setRole = async (user: AdminUser, role: AdminUser['role']) => {
    try {
      await send(`/api/admin/users/${user.id}`, { method: 'PATCH', body: { role } });
      setUsers((list) => list.map((u) => (u.id === user.id ? { ...u, role } : u)));
    } catch (error) {
      toast(errorText(error));
    }
  };

  return (
    <section>
      <div className="section-head">
        <h2 id="readers-title">{t('usersTitle')}</h2>
      </div>
      <div className="table-scroll" role="region" aria-labelledby="readers-title" tabIndex={0}>
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">{t('feedName')}</th>
              <th scope="col">{t('email')}</th>
              <th scope="col">{t('joined')}</th>
              <th scope="col">{t('lastLogin')}</th>
              <th scope="col">{t('role')}</th>
              <th scope="col">
                <span className="sr-only">{t('actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <th scope="row">
                  {user.username}
                  {user.googleLinked && <span className="badge" style={{ marginLeft: '0.4rem' }}>Google</span>}
                </th>
                <td className="truncate">{user.email}</td>
                <td suppressHydrationWarning>{formatDate(user.createdAt, locale, { dateStyle: 'medium' })}</td>
                <td>{user.lastLoginAt ? <TimeAgo value={user.lastLoginAt} /> : '—'}</td>
                <td>
                  <select
                    className="select"
                    style={{ minHeight: '2.25rem', padding: '0.2rem 2rem 0.2rem 0.5rem' }}
                    value={user.role}
                    aria-label={t('roleFor', { username: user.username })}
                    disabled={user.id === me?.id}
                    onChange={(event) => setRole(user, event.target.value as AdminUser['role'])}
                  >
                    <option value="user">{t('roleUser')}</option>
                    <option value="admin">{t('roleAdmin')}</option>
                  </select>
                </td>
                <td>
                  {user.role === 'user' ? (
                    <button type="button" className="btn btn--small" aria-label={tReset('buttonFor', { username: user.username })} onClick={() => createResetLink(user)}>
                      {tReset('button')}
                    </button>
                  ) : (
                    <span className="field__hint">{tReset('editorNote')}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={Boolean(reset)} onClose={() => setReset(null)} title={tReset('title')}>
        {reset && (
          <div className="stack">
            <p>{tReset('body', { email: reset.email, time: formatDate(reset.expiresAt, locale, { timeStyle: 'short' }) })}</p>
            <label className="sr-only" htmlFor="reset-url">{tReset('title')}</label>
            <textarea id="reset-url" className="input mono reset-url" readOnly rows={4} value={reset.url} onFocus={(e) => e.currentTarget.select()} />
            <div className="dialog__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setReset(null)}>
                {tCommon('close')}
              </button>
              <button type="button" className="btn btn--solid" onClick={copyResetLink} data-autofocus>
                {tReset('copy')}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  );
}

export function AdminDesk({ overview: initialOverview, feeds, users, requests }: Props) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const toast = useToast();
  const errorText = useErrorText();
  const { data, mutate } = useSWR<AdminOverview>('/api/admin/overview', fetcher, { fallbackData: initialOverview, revalidateOnMount: false });
  const overview = data ?? initialOverview;

  const runJob = async (job: string) => {
    try {
      await send(`/api/admin/sync/${job}`);
      await mutate();
    } catch (error) {
      toast(errorText(error));
    }
  };

  const stats: [string, number][] = [
    [t('users'), overview.counts.users],
    [t('pendingRequests'), overview.signups?.pending ?? requests.length],
    [t('articles'), overview.counts.articles],
    [t('feeds'), overview.counts.feeds],
    [t('coins'), overview.counts.coins],
  ];

  return (
    <div className="admin-grid">
      {overview.demo && (
        <p className="form-alert form-alert--info" role="note">
          {t('demoNotice')}
        </p>
      )}
      <dl className="admin-stats">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{formatNumber(value, locale)}</dd>
          </div>
        ))}
      </dl>
      {/* Demo session: a disabled fieldset turns every button, toggle and input off at once. */}
      <fieldset className="plain-fieldset admin-grid" disabled={Boolean(overview.demo)}>
        <AccessRequests initial={requests} signups={overview.signups} onChange={() => void mutate()} />
        <Presses sync={overview.sync} onRun={runJob} retentionDays={overview.articleRetentionDays} />
        <Feeds initial={feeds} />
        <Limits settings={overview.settings} />
        <Readers initial={users} />
      </fieldset>
      <p className="page-head__meta">Kryptonews v{overview.version}</p>
    </div>
  );
}
