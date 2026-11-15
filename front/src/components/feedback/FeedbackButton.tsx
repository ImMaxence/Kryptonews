'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { REPO_URL, VERSION } from '@/lib/site';
import { useSession } from '../providers/SessionProvider';
import { Dialog } from '../ui/Dialog';

type Kind = 'bug' | 'idea';

function context(kind: Kind) {
  const lines = [`Page: ${window.location.origin}${window.location.pathname}`, `Version: ${VERSION}`];
  if (kind === 'bug') {
    lines.push(`Browser: ${navigator.userAgent}`, `Screen: ${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio}x`);
    lines.push(`Theme: ${document.documentElement.dataset.theme ?? 'system'}`);
  }
  return lines;
}

/**
 * "Letters to the editor": a bug report or feedback, either as a pre-filled GitHub
 * issue (public, uses the repository issue forms) or as a pre-filled email (private).
 */
export function FeedbackButton({ className = 'btn btn--small' }: { className?: string }) {
  const t = useTranslations('feedback');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { config } = useSession();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>('bug');
  const [issueHref, setIssueHref] = useState(`${REPO_URL}/issues/new/choose`);

  const githubUrl = () => {
    const params = new URLSearchParams({
      template: kind === 'bug' ? 'bug_report.yml' : 'feedback.yml',
      title: `[${kind === 'bug' ? 'Bug' : 'Feedback'}] `,
      // Issue forms pre-fill fields whose id matches a query parameter.
      context: context(kind).join('\n'),
      language: locale,
    });
    return `${REPO_URL}/issues/new?${params.toString()}`;
  };

  // window/navigator only exist in the browser: build the pre-filled link once the dialog opens.
  useEffect(() => {
    if (open) setIssueHref(githubUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kind]);

  const sendEmail = () => {
    if (!config?.contact) return;
    const address = window.atob(config.contact);
    const subject = `[Kryptonews] ${kind === 'bug' ? t('subjectBug') : t('subjectIdea')}`;
    const body = `${t('describe')}\n\n\n\n---\n${context(kind).join('\n')}`;
    window.location.href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {t('button')}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={t('title')}>
        <div className="stack">
          <p>{t('body')}</p>
          <fieldset className="feedback-kind">
            <legend className="field__label">{t('typeLabel')}</legend>
            {(['bug', 'idea'] as const).map((value) => (
              <label key={value} className="checkbox">
                <input type="radio" name="feedback-kind" value={value} checked={kind === value} onChange={() => setKind(value)} />
                <span>{t(value)}</span>
              </label>
            ))}
          </fieldset>
          <div className="feedback-actions">
            <div>
              <a className="btn btn--solid" href={issueHref} target="_blank" rel="noopener noreferrer">
                {t('github')}
                <span className="sr-only"> {tCommon('opensInNewTab')}</span>
              </a>
              <p className="field__hint">{t('githubHint')}</p>
            </div>
            {config?.contact && (
              <div>
                <button type="button" className="btn" onClick={sendEmail}>
                  {t('email')}
                </button>
                <p className="field__hint">{t('emailHint')}</p>
              </div>
            )}
          </div>
          <p className="field__hint">{t('privacy')}</p>
          <div className="dialog__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>
              {tCommon('close')}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
