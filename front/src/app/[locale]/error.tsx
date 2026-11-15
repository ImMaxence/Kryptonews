'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errorPage');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="wrap erratum" role="alert">
      <span className="stamp">{t('kicker')}</span>
      <h1 className="erratum__title">{t('title')}</h1>
      <p className="erratum__body">{t('body')}</p>
      <div className="erratum__links">
        <button type="button" className="btn btn--solid" onClick={reset}>
          {t('retry')}
        </button>
        <FeedbackButton className="btn" />
      </div>
    </div>
  );
}
