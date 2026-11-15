'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '../Icons';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'kn-theme';

function currentTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  if (attr === 'light' || attr === 'dark') return attr;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Inline script run before paint: applies the stored theme without a flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})();`;

export function ThemeToggle() {
  const t = useTranslations('header');
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(currentTheme());
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTheme(currentTheme());
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (private mode): the choice simply won't persist.
    }
    setTheme(next);
  };

  const toNight = theme === 'light';
  return (
    <button type="button" className="tool-link" onClick={toggle} aria-label={toNight ? t('switchToNight') : t('switchToDay')}>
      {toNight ? <MoonIcon /> : <SunIcon />}
      <span aria-hidden="true">{toNight ? t('nightEdition') : t('dayEdition')}</span>
    </button>
  );
}
