'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter as useNextRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useSWRConfig } from 'swr';
import { useErrorText, useFieldText } from '@/hooks/useErrorText';
import { Link, useRouter } from '@/i18n/navigation';
import { ApiError, send } from '@/lib/client-api';
import { formatDate } from '@/lib/format';
import { clearGuestStore, writeGuestStore } from '@/lib/guest-store';
import type { User } from '@/lib/types';
import { useSession } from '../providers/SessionProvider';
import { useToast } from '../providers/ToastProvider';
import { Dialog } from '../ui/Dialog';
import { Field, FormAlert, PasswordInput, describedBy } from '../forms/Field';

const isPlaceholderEmail = (email: string) => email.endsWith('@users.noreply.invalid');

function PressCard({ user }: { user: User }) {
  const t = useTranslations('account');
  const tGuest = useTranslations('guestMode');
  const locale = useLocale();
  return (
    <figure className="press-card" aria-label={t('kicker')}>
      <div className="press-card__band" aria-hidden="true">
        <span>{t('press')}</span>
        <span>K</span>
      </div>
      <div className="press-card__body">
        <img className="press-card__photo" src={`/avatars/user${user.avatar}.svg`} alt="" width={104} height={128} />
        <figcaption>
          <p className="press-card__name">{user.username}</p>
          <div className="press-card__lines">
            <span>{user.isGuest ? tGuest('label') : user.role === 'admin' ? t('roleAdmin') : t('roleUser')}</span>
            <span suppressHydrationWarning>{t('memberSince', { date: formatDate(user.createdAt, locale, { dateStyle: 'long' }) })}</span>
            <span className="mono">{t('cardNo', { id: String(user.id).padStart(5, '0') })}</span>
            {user.googleLinked && <span>{t('googleLinked')}</span>}
          </div>
        </figcaption>
      </div>
      <div className="press-card__barcode" aria-hidden="true" />
      <span className="stamp" aria-hidden="true">
        {user.isGuest ? tGuest('label') : 'Kryptonews'}
      </span>
    </figure>
  );
}

function ProfileForm({ user }: { user: User }) {
  const t = useTranslations('account');
  const errorText = useErrorText();
  const fieldText = useFieldText();
  const nextRouter = useNextRouter();
  const { setUser } = useSession();
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<{ message: string; ok: boolean } | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const tGuest = useTranslations('guestMode');
  const placeholder = isPlaceholderEmail(user.email);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {
      username: String(data.get('username') ?? '').trim(),
      avatar: Number(data.get('avatar')),
      locale: String(data.get('locale')),
    };
    if (user.isGuest) {
      const username = String(body.username);
      if (!/^[\p{L}\p{N}_.-]{3,32}$/u.test(username)) {
        setErrors({ username: fieldText('username', 'invalid') });
        return;
      }
      const avatar = Number(body.avatar) || user.avatar;
      writeGuestStore({ profile: { username, avatar } });
      setUser({ ...user, username, avatar });
      setAlert({ message: tGuest('savedLocally'), ok: true });
      return;
    }
    const email = String(data.get('email') ?? '').trim();
    if (email && email !== user.email) body.email = email;

    setPending(true);
    setErrors({});
    setAlert(null);
    try {
      const { user: updated } = await send<{ user: User }>('/api/users/me', { method: 'PATCH', body });
      setUser(updated);
      setAlert({ message: t('profileSaved'), ok: true });
      nextRouter.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.fields) {
        setErrors(Object.fromEntries(Object.entries(error.fields).map(([f, c]) => [f, fieldText(f, c)])));
      } else if (error instanceof ApiError && error.code === 'username_taken') {
        setErrors({ username: errorText(error) });
      } else if (error instanceof ApiError && error.code === 'email_taken') {
        setErrors({ email: errorText(error) });
      }
      setAlert({ message: errorText(error), ok: false });
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="panel" aria-labelledby="profile-title">
      <h2 id="profile-title" className="panel__title">
        {t('profileTitle')}
      </h2>
      <form method="post" onSubmit={onSubmit} className="stack">
        <FormAlert message={alert?.message ?? null} ok={alert?.ok} />
        <Field id="acc-username" label={t('username')} error={errors.username}>
          <input {...describedBy('acc-username', { error: errors.username })} name="username" className="input" defaultValue={user.username} autoComplete="username" required minLength={3} maxLength={32} />
        </Field>
        {!user.isGuest && (
        <Field id="acc-email" label={t('email')} error={errors.email} hint={placeholder ? t('noEmail') : undefined}>
          <input
            {...describedBy('acc-email', { error: errors.email, hint: placeholder })}
            name="email"
            type="email"
            className="input"
            defaultValue={placeholder ? '' : user.email}
            autoComplete="email"
            maxLength={254}
          />
        </Field>
        )}
        {!user.isGuest && (
        <Field id="acc-locale" label={t('locale')}>
          <select id="acc-locale" name="locale" className="select" defaultValue={user.locale}>
            <option value="fr" lang="fr">
              Français
            </option>
            <option value="en" lang="en">
              English
            </option>
          </select>
        </Field>
        )}
        <fieldset className="avatar-picker">
          <legend className="field__label">{t('avatar')}</legend>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <label key={n}>
              <input type="radio" name="avatar" value={n} defaultChecked={user.avatar === n} aria-label={t('avatarOption', { n })} />
              <img src={`/avatars/user${n}.svg`} alt="" width={56} height={56} />
            </label>
          ))}
        </fieldset>
        <button type="submit" className="btn btn--solid" disabled={pending} aria-busy={pending}>
          {t('saveProfile')}
        </button>
      </form>
    </section>
  );
}

function PasswordForm({ user }: { user: User }) {
  const t = useTranslations('account');
  const tAuth = useTranslations('auth');
  const { setUser } = useSession();
  const errorText = useErrorText();
  const fieldText = useFieldText();
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<{ message: string; ok: boolean } | null>(null);
  const [error, setError] = useState<string | undefined>();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPassword = String(data.get('newPassword') ?? '');
    if (newPassword.length < 10) {
      setError(fieldText('newPassword', 'too_small'));
      return;
    }
    setPending(true);
    setError(undefined);
    setAlert(null);
    try {
      await send('/api/users/me/password', {
        method: 'PUT',
        body: { currentPassword: String(data.get('currentPassword') ?? '') || undefined, newPassword },
      });
      form.reset();
      setAlert({ message: t('passwordSaved'), ok: true });
      if (user.mustChangePassword) setUser({ ...user, mustChangePassword: false });
    } catch (err) {
      setAlert({ message: errorText(err), ok: false });
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="panel" aria-labelledby="password-title">
      <h2 id="password-title" className="panel__title">
        {t('passwordTitle')}
      </h2>
      <form method="post" onSubmit={onSubmit} className="stack">
        {!user.hasPassword && <p className="field__hint">{t('setPasswordNote')}</p>}
        {user.mustChangePassword && <p className="form-alert form-alert--info">{t('mustChangeBody')}</p>}
        <FormAlert message={alert?.message ?? null} ok={alert?.ok} />
        {user.hasPassword && (
          <Field id="acc-current" label={t('currentPassword')}>
            <PasswordInput id="acc-current" name="currentPassword" autoComplete="current-password" required maxLength={128} />
          </Field>
        )}
        <Field id="acc-new" label={t('newPassword')} hint={tAuth('passwordHint')} error={error}>
          <PasswordInput {...describedBy('acc-new', { hint: true, error })} name="newPassword" autoComplete="new-password" required minLength={10} maxLength={128} />
        </Field>
        <button type="submit" className="btn" disabled={pending} aria-busy={pending}>
          {t('savePassword')}
        </button>
      </form>
    </section>
  );
}

function DangerZone({ user }: { user: User }) {
  const t = useTranslations('account');
  const tCommon = useTranslations('common');
  const errorText = useErrorText();
  const router = useRouter();
  const nextRouter = useNextRouter();
  const { setUser } = useSession();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const onDelete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setAlert(null);
    try {
      await send('/api/users/me', {
        method: 'DELETE',
        body: user.hasPassword ? { password: String(data.get('password') ?? '') } : { confirm: String(data.get('confirm') ?? '') },
      });
      setUser(null);
      router.replace('/');
      nextRouter.refresh();
    } catch (error) {
      setAlert(errorText(error));
      setPending(false);
    }
  };

  const logout = async () => {
    await send('/api/auth/logout').catch(() => undefined);
    setUser(null);
    router.replace('/');
    nextRouter.refresh();
  };

  return (
    <>
      <section className="panel" aria-labelledby="data-title">
        <h2 id="data-title" className="panel__title">
          {t('dataTitle')}
        </h2>
        <p>{t('dataBody')}</p>
        <p style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <a className="btn" href="/api/users/me/export" download>
            {t('export')}
          </a>
          <button type="button" className="btn btn--ghost" onClick={logout}>
            {t('logout')}
          </button>
        </p>
      </section>

      <section className="panel" aria-labelledby="danger-title">
        <h2 id="danger-title" className="panel__title">
          {t('dangerTitle')}
        </h2>
        <p>{t('dangerBody')}</p>
        <p style={{ marginTop: '1rem' }}>
          <button type="button" className="btn btn--danger" onClick={() => setOpen(true)}>
            {t('deleteCta')}
          </button>
        </p>
      </section>

      <Dialog open={open} onClose={() => setOpen(false)} title={t('deleteDialogTitle')}>
        <form method="post" onSubmit={onDelete} className="stack">
          <p>{t('deleteDialogBody')}</p>
          <FormAlert message={alert} />
          {user.hasPassword ? (
            <Field id="del-password" label={t('deletePassword')}>
              <PasswordInput id="del-password" name="password" autoComplete="current-password" required />
            </Field>
          ) : (
            <Field id="del-confirm" label={t('deleteConfirm', { username: user.username })}>
              <input id="del-confirm" name="confirm" className="input" required autoComplete="off" />
            </Field>
          )}
          <div className="dialog__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>
              {tCommon('cancel')}
            </button>
            <button type="submit" className="btn btn--danger" disabled={pending} aria-busy={pending}>
              {t('deleteSubmit')}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

/** Guest mode: what was saved in this browser can be wiped in one click. */
function GuestData() {
  const tGuest = useTranslations('guestMode');
  const toast = useToast();
  const nextRouter = useNextRouter();
  const { mutate } = useSWRConfig();
  const reset = async () => {
    clearGuestStore();
    await mutate('/api/favorites');
    nextRouter.refresh();
    toast(tGuest('resetDone'));
  };
  return (
    <section className="panel" aria-labelledby="guest-data-title">
      <h2 id="guest-data-title" className="panel__title">
        {tGuest('dataTitle')}
      </h2>
      <p>{tGuest('dataBody')}</p>
      <p style={{ marginTop: '1rem' }}>
        <button type="button" className="btn btn--danger" onClick={reset}>
          {tGuest('reset')}
        </button>
      </p>
    </section>
  );
}

export function AccountPanel() {
  const t = useTranslations('account');
  const tHeader = useTranslations('header');
  const { user } = useSession();
  const [passwordFirst] = useState(Boolean(user?.mustChangePassword));
  if (!user) return null;
  return (
    <div className="account">
      <div className="account__card">
        <PressCard user={user} />
        {(user.role === 'admin' || user.isGuest) && (
          <Link href="/admin" className="btn btn--small">
            {tHeader('admin')}
          </Link>
        )}
      </div>
      <div className="account__sections">
        {user.isGuest && (
          <p className="form-alert form-alert--info" role="note">
            {t('guestNotice')}
          </p>
        )}
        {/* Temporary password from the editors: choosing one's own comes first (order fixed at mount). */}
        {passwordFirst && <PasswordForm user={user} />}
        <ProfileForm user={user} />
        {user.isGuest ? <GuestData /> : passwordFirst ? null : user.hasPassword ? <PasswordForm user={user} /> : <p className="field__hint">{t('setPasswordNote')}</p>}
        {!user.isGuest && <DangerZone user={user} />}
      </div>
    </div>
  );
}
