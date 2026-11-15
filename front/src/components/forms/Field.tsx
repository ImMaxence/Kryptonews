'use client';

import { useTranslations } from 'next-intl';
import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { EyeIcon } from '../Icons';

/** Accessible props for an input wired to its hint and error messages. */
export function describedBy(id: string, { hint, error }: { hint?: ReactNode; error?: ReactNode }) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return {
    id,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': ids.length ? ids.join(' ') : undefined,
  };
}

export function Field({ id, label, hint, error, children }: { id: string; label: ReactNode; hint?: ReactNode; error?: ReactNode; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const t = useTranslations('auth');
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-group">
      <input {...props} type={visible ? 'text' : 'password'} className="input" />
      <button
        type="button"
        className="icon-btn input-group__btn"
        aria-label={visible ? t('hidePassword') : t('showPassword')}
        aria-pressed={visible}
        aria-controls={props.id}
        onClick={() => setVisible((v) => !v)}
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  );
}

export function FormAlert({ message, ok = false }: { message: string | null; ok?: boolean }) {
  return (
    <div role={ok ? 'status' : 'alert'} aria-live={ok ? 'polite' : 'assertive'}>
      {message && <p className={`form-alert${ok ? ' form-alert--ok' : ''}`}>{message}</p>}
    </div>
  );
}
