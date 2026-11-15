'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { formatDate, formatRelative } from '@/lib/format';

/**
 * Server renders an absolute (Paris time) date; once hydrated it switches to a
 * relative "12 min ago" that refreshes every minute. The full date stays in `title`.
 */
export function TimeAgo({
  value,
  prefix,
  template,
}: {
  value: string;
  /** Client-side only: wraps the label (functions cannot cross the server/client boundary). */
  prefix?: (time: string) => string;
  /** Serializable alternative to `prefix`, e.g. "Updated {time}". */
  template?: string;
}) {
  const locale = useLocale();
  const absolute = formatDate(value, locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const [label, setLabel] = useState(absolute);

  useEffect(() => {
    const update = () => setLabel(formatRelative(value, locale));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [value, locale]);

  const full = formatDate(value, locale, { dateStyle: 'full', timeStyle: 'short' });
  return (
    <time dateTime={value} title={full} suppressHydrationWarning>
      {prefix ? prefix(label) : template ? template.replace('{time}', label) : label}
    </time>
  );
}
