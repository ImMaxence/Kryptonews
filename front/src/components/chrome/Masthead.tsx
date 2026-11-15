'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LockIcon } from '../Icons';
import { useSession } from '../providers/SessionProvider';
import { AccountLinks } from './AccountLinks';
import { LocaleSwitch } from './LocaleSwitch';
import { NotificationsButton } from '../pwa/NotificationsButton';
import { ThemeToggle } from './ThemeToggle';

const SECTIONS = [
  { href: '/', key: 'home' },
  { href: '/markets', key: 'markets' },
  { href: '/news', key: 'news' },
  { href: '/favorites', key: 'favorites' },
  { href: '/about', key: 'about' },
] as const;

export function Masthead({ edition, dateLabel, isoDate }: { edition: number; dateLabel: string; isoDate: string }) {
  const t = useTranslations('header');
  const tNav = useTranslations('nav');
  const pathname = usePathname();
  const { user } = useSession();
  const isHome = pathname === '/';

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <header className={`masthead ${isHome ? 'masthead--full' : 'masthead--compact'}`}>
        <div className="masthead__utility wrap">
          <p className="masthead__edition">
            <Link href={{ pathname: '/about', hash: 'history' }} className="masthead__edition-link" title={t('editionHelp', { number: edition })}>
              {t('edition', { number: edition })}
            </Link>
            <span aria-hidden="true">·</span>
            <time dateTime={isoDate}>{dateLabel}</time>
          </p>
          <div className="masthead__tools" role="group" aria-label={t('utilities')}>
            <LocaleSwitch />
            <ThemeToggle />
            <NotificationsButton />
            <AccountLinks />
          </div>
        </div>

        {isHome && (
          <div className="masthead__title wrap">
            <p className="masthead__aside masthead__aside--start">
              <strong>{t('tagline')}</strong>
              {t('motto')}
            </p>
            <Link href="/" className="masthead__logo" aria-current="page">
              Kryptonews
            </Link>
            <p className="masthead__aside masthead__aside--end" aria-hidden="true">
              <strong>{dateLabel}</strong>
              {t('edition', { number: edition })}
            </p>
          </div>
        )}
      </header>

      <nav className="sections" aria-label={t('mainNav')}>
        <div className="sections__inner wrap">
          {!isHome && (
            <Link href="/" className="sections__logo" aria-label={t('homeLink')}>
              Kryptonews
            </Link>
          )}
          <ul className="sections__list">
            {SECTIONS.map((section) => (
              <li key={section.key}>
                <Link
                  href={section.href}
                  className="sections__link"
                  aria-current={isActive(section.href) ? 'page' : undefined}
                >
                  {tNav(section.key)}
                  {section.key === 'favorites' && !user && <LockIcon />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
