'use client';

import { useTranslations } from 'next-intl';
import { useRouter as useNextRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useErrorText } from '@/hooks/useErrorText';
import { Link, useRouter } from '@/i18n/navigation';
import { send } from '@/lib/client-api';
import type { User } from '@/lib/types';
import { useSession } from '../providers/SessionProvider';
import { Field, FormAlert, PasswordInput, describedBy } from './Field';

/** No token: explain the editor-assisted procedure and offer a pre-filled email. */
export function ForgotPassword() {
  const t = useTranslations('reset');
  const { config } = useSession();

  const write = () => {
    if (!config?.contact) return;
    const address = window.atob(config.contact);
    window.location.href = `mailto:${address}?subject=${encodeURIComponent(`[Kryptonews] ${t('emailSubject')}`)}&body=${encodeURIComponent(t('emailBody'))}`;
  };

  return (
    <div className="auth__form">
      <p>{t('forgotBody')}</p>
      {config?.contact ? (
        <button type="button" className="btn btn--solid" onClick={write}>
          {t('forgotEmail')}
        </button>
      ) : (
        <p className="form-alert form-alert--info">{t('forgotNoEmail')}</p>
      )}
      <p className="auth__switch">
        <Link href="/login">{t('backToLogin')}</Link>
      </p>
    </div>
  );
}

/** With a token: choose a new password, then the reader is signed in. */
export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations('reset');
  const tAuth = useTranslations('auth');
  const errorText = useErrorText();
  const router = useRouter();
  const nextRouter = useNextRouter();
  const { setUser } = useSession();
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') ?? '');
    if (password.length < 10) return setError(tAuth('passwordHint'));
    if (password !== String(data.get('confirm') ?? '')) return setError(t('mismatch'));
    setError(undefined);
    setPending(true);
    setAlert(null);
    try {
      const { user } = await send<{ user: User }>('/api/auth/reset', { body: { token, password } });
      setUser(user);
      router.replace('/account');
      nextRouter.refresh();
    } catch (err) {
      setAlert(errorText(err));
      setPending(false);
    }
  };

  return (
    <form method="post" className="auth__form" onSubmit={onSubmit} noValidate>
      <p>{t('setBody')}</p>
      <FormAlert message={alert} />
      <Field id="reset-password" label={t('newPassword')} hint={tAuth('passwordHint')} error={error}>
        <PasswordInput {...describedBy('reset-password', { hint: true, error })} name="password" autoComplete="new-password" required minLength={10} maxLength={128} />
      </Field>
      <Field id="reset-confirm" label={t('confirm')}>
        <PasswordInput id="reset-confirm" name="confirm" autoComplete="new-password" required minLength={10} maxLength={128} />
      </Field>
      <button type="submit" className="btn btn--solid" disabled={pending} aria-busy={pending}>
        {t('submit')}
      </button>
    </form>
  );
}
