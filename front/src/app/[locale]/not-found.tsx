import { getTranslations } from 'next-intl/server';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <div className="wrap erratum">
      <span className="stamp">{t('kicker')}</span>
      <h1 className="erratum__title">{t('title')}</h1>
      <p className="erratum__body">{t('body')}</p>
      <div className="erratum__links">
        <Link href="/" className="btn btn--solid">
          {t('home')}
        </Link>
        <Link href="/markets" className="btn">
          {t('markets')}
        </Link>
        <Link href="/news" className="btn">
          {t('news')}
        </Link>
        <FeedbackButton className="btn btn--dashed" />
      </div>
    </div>
  );
}
