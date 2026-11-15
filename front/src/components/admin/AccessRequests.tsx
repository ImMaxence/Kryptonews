'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useErrorText } from '@/hooks/useErrorText';
import { send } from '@/lib/client-api';
import type { AccessApproval, AccessRequest, AdminOverview } from '@/lib/types';
import { useToast } from '../providers/ToastProvider';
import { Dialog } from '../ui/Dialog';
import { TimeAgo } from '../ui/TimeAgo';

type Signups = NonNullable<AdminOverview['signups']>;

/**
 * Access requests waiting for an editor. Approving creates the reader with a temporary
 * password and prepares the email to send them; declining deletes the request.
 */
export function AccessRequests({ initial, signups, onChange }: { initial: AccessRequest[]; signups?: Signups; onChange: () => void }) {
  const t = useTranslations('requests');
  const tCommon = useTranslations('common');
  const toast = useToast();
  const errorText = useErrorText();
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(signups?.open ?? true);
  const [busy, setBusy] = useState<number | 'all' | 'toggle' | null>(null);
  const [approval, setApproval] = useState<AccessApproval | null>(null);

  const remove = (id: number) => setItems((list) => list.filter((item) => item.id !== id));
  const fullName = (r: AccessRequest) => `${r.firstName} ${r.lastName}`;

  const approve = async (request: AccessRequest) => {
    setBusy(request.id);
    try {
      setApproval(await send<AccessApproval>(`/api/admin/requests/${request.id}/approve`));
      remove(request.id);
      onChange();
    } catch (error) {
      toast(errorText(error));
      if ((error as { code?: string }).code === 'email_taken') remove(request.id);
    } finally {
      setBusy(null);
    }
  };

  const decline = async (request: AccessRequest) => {
    if (!window.confirm(t('declineConfirm', { name: fullName(request) }))) return;
    setBusy(request.id);
    try {
      await send(`/api/admin/requests/${request.id}`, { method: 'DELETE' });
      remove(request.id);
      toast(t('declined'));
      onChange();
    } catch (error) {
      toast(errorText(error));
    } finally {
      setBusy(null);
    }
  };

  const declineAll = async () => {
    if (!window.confirm(t('declineAllConfirm', { count: items.length }))) return;
    setBusy('all');
    try {
      const { deleted } = await send<{ deleted: number }>('/api/admin/requests', { method: 'DELETE' });
      setItems([]);
      toast(t('clearedAll', { count: deleted }));
      onChange();
    } catch (error) {
      toast(errorText(error));
    } finally {
      setBusy(null);
    }
  };

  const toggle = async (next: boolean) => {
    setBusy('toggle');
    setOpen(next);
    try {
      await send('/api/admin/settings', { method: 'PUT', body: { signupsOpen: next } });
      toast(next ? t('nowOpen') : t('nowClosed'));
      onChange();
    } catch (error) {
      setOpen(!next);
      toast(errorText(error));
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    if (!approval) return;
    try {
      await navigator.clipboard.writeText(approval.message.body);
      toast(t('copied'));
    } catch {
      // Clipboard blocked: the text stays selectable in the dialog.
    }
  };

  const mailto = approval
    ? `mailto:${approval.to}?subject=${encodeURIComponent(approval.message.subject)}&body=${encodeURIComponent(approval.message.body)}`
    : '#';

  return (
    <section>
      <div className="section-head">
        <h2 id="requests-title">{t('title')}</h2>
        {items.length > 1 && (
          <button type="button" className="btn btn--small btn--ghost" onClick={declineAll} disabled={busy !== null} aria-busy={busy === 'all'}>
            {t('declineAll')}
          </button>
        )}
      </div>
      <div className="panel stack">
        <label className="checkbox">
          <input type="checkbox" checked={open} disabled={busy === 'toggle'} onChange={(event) => toggle(event.target.checked)} />
          <span>{t('open')}</span>
        </label>
        {signups && (
          <p className="field__hint">
            {t('stats', {
              pending: items.length,
              maxPending: signups.maxPending,
              lastDay: signups.lastDay,
              perHour: signups.maxPerHour,
              perDay: signups.maxPerDay,
              days: signups.pendingDays,
            })}
          </p>
        )}
      </div>
      {items.length === 0 ? (
        <p className="field__hint requests__empty">{t('empty')}</p>
      ) : (
        <div className="table-scroll" role="region" aria-labelledby="requests-title" tabIndex={0}>
          <table className="data-table requests-table" role="table">
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">{t('name')}</th>
                <th scope="col" role="columnheader">{t('email')}</th>
                <th scope="col" role="columnheader">{t('received')}</th>
                <th scope="col" role="columnheader">{t('language')}</th>
                <th scope="col" role="columnheader">
                  <span className="sr-only">{t('actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {items.map((request) => (
                <tr key={request.id} role="row">
                  <th scope="row" role="rowheader">{fullName(request)}</th>
                  <td role="cell" className="truncate" data-label={t('email')}>{request.email}</td>
                  <td role="cell" data-label={t('received')}>
                    <TimeAgo value={request.createdAt} />
                  </td>
                  <td role="cell" data-label={t('language')}>{request.locale.toUpperCase()}</td>
                  <td role="cell">
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn btn--small btn--solid"
                        onClick={() => approve(request)}
                        disabled={busy !== null}
                        aria-busy={busy === request.id}
                        aria-label={t('approveFor', { name: fullName(request) })}
                      >
                        {t('approve')}
                      </button>
                      <button
                        type="button"
                        className="btn btn--small"
                        onClick={() => decline(request)}
                        disabled={busy !== null}
                        aria-label={t('declineFor', { name: fullName(request) })}
                      >
                        {t('decline')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={Boolean(approval)} onClose={() => setApproval(null)} title={t('approvedTitle')}>
        {approval && (
          <div className="stack">
            <p>{t('approvedBody', { email: approval.to })}</p>
            <label className="sr-only" htmlFor="approval-message">
              {t('messageLabel')}
            </label>
            <textarea
              id="approval-message"
              className="input mono reset-url"
              readOnly
              rows={10}
              value={approval.message.body}
              onFocus={(event) => event.currentTarget.select()}
            />
            <div className="dialog__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setApproval(null)}>
                {tCommon('close')}
              </button>
              <button type="button" className="btn" onClick={copy}>
                {t('copy')}
              </button>
              <a className="btn btn--solid" href={mailto} data-autofocus>
                {t('writeEmail')}
              </a>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  );
}
