import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { AUTHOR_URL, COINGECKO_URL, REPO_URL, VERSION } from '@/lib/site';
import { FeedbackButton } from '../feedback/FeedbackButton';

export async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tCommon = await getTranslations('common');
  const newTab = <span className="sr-only"> {tCommon('opensInNewTab')}</span>;

  return (
    <footer className="colophon">
      <div className="wrap">
        <div className="colophon__grid">
          <div className="colophon__brand">
            <Link href="/" className="colophon__logo">
              Kryptonews
            </Link>
            <p>{t('tagline')}</p>
            <div className="colophon__letters">
              <h2>{t('letters')}</h2>
              <FeedbackButton />
            </div>
          </div>

          <nav aria-labelledby="footer-sections">
            <h2 id="footer-sections">{t('sections')}</h2>
            <ul>
              <li><Link href="/">{tNav('home')}</Link></li>
              <li><Link href="/markets">{tNav('markets')}</Link></li>
              <li><Link href="/news">{tNav('news')}</Link></li>
              <li><Link href="/favorites">{tNav('favorites')}</Link></li>
              <li><Link href="/about">{tNav('about')}</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal">{t('legal')}</h2>
            <ul>
              <li><Link href="/legal-notice">{t('legalNotice')}</Link></li>
              <li><Link href="/privacy">{t('privacy')}</Link></li>
              <li><Link href="/terms">{t('terms')}</Link></li>
              <li><Link href="/accessibility">{t('accessibility')}</Link></li>
              <li><Link href="/admin">{t('editorAccess')}</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-resources">
            <h2 id="footer-resources">{t('resources')}</h2>
            <ul>
              <li><a href="/sitemap.xml">{t('sitemap')}</a></li>
              <li><a href="/llms.txt">{t('llms')}</a></li>
              <li>
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  {t('source')}
                  {newTab}
                </a>
              </li>
              <li>
                <a href={AUTHOR_URL} target="_blank" rel="noopener">
                  {t('builtBy')}
                  {newTab}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="colophon__fine">
          <p className="colophon__disclaimer">{t('disclaimer')}</p>
          <p>
            {t.rich('dataCredit', {
              link: (chunks) => (
                <a href={COINGECKO_URL} target="_blank" rel="noopener noreferrer">
                  {chunks}
                  {newTab}
                </a>
              ),
            })}{' '}
            {t('newsCredit')}
          </p>
          <p>
            {t('rights', { year: new Date().getFullYear() })} · {t('edition', { version: VERSION })}
          </p>
        </div>
      </div>
    </footer>
  );
}
