'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useErrorText } from '@/hooks/useErrorText';
import { useFavorites } from '@/hooks/useFavorites';
import type { Favorite } from '@/lib/types';
import { Link } from '@/i18n/navigation';
import { LockIcon, ScissorsIcon, StarIcon } from '../Icons';
import { useToast } from '../providers/ToastProvider';

/** Clip (article) or watch (coin) toggle. Guests get a link to the login page instead. */
export function SaveButton({
  kind,
  refId,
  label,
  flat = false,
  meta,
}: {
  kind: 'article' | 'crypto';
  refId: string | number;
  label: string;
  flat?: boolean;
  /** Details kept with a guest's local clipping (url, image, source). */
  meta?: Partial<Favorite>;
}) {
  const t = useTranslations('save');
  const toast = useToast();
  const errorText = useErrorText();
  const tGuest = useTranslations('guestMode');
  const { enabled, find, add, remove, guest } = useFavorites();
  const [busy, setBusy] = useState(false);

  const className = `save-btn${flat ? ' save-btn--flat' : ''}`;

  if (!enabled) {
    return (
      <Link href="/login" className={`${className} save-btn--locked`} aria-label={t('loginToClip')} title={t('loginToClip')}>
        <LockIcon />
      </Link>
    );
  }

  const existing = find(kind, refId);
  const pressed = Boolean(existing);
  const actionLabel =
    kind === 'article'
      ? pressed
        ? t('unclip', { title: label })
        : t('clip', { title: label })
      : pressed
        ? t('unwatch', { name: label })
        : t('watch', { name: label });

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (existing) {
        await remove(existing.id);
        toast(guest ? tGuest('simulated') : t('removed'));
      } else {
        await add(kind, refId, label, meta);
        toast(guest ? tGuest('simulated') : t('clipped'));
      }
    } catch (error) {
      toast(errorText(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" className={className} aria-pressed={pressed} aria-label={actionLabel} title={actionLabel} onClick={onClick} disabled={busy}>
      {kind === 'article' ? <ScissorsIcon /> : <StarIcon filled={pressed} />}
    </button>
  );
}
