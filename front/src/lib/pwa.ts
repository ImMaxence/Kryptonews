'use client';

import { useEffect, useReducer } from 'react';

/** Chromium's install prompt event (not in the DOM typings yet). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
let initialised = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** Registers the service worker (production only) and captures the install prompt. */
export function initPwa() {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;
  installed = window.matchMedia('(display-mode: standalone)').matches;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installed = true;
    notify();
  });

  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const register = () => navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }
}

/** `install` is non-null when the browser offers installation; `installed` when running as an app. */
export function useInstallPrompt() {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, []);
  return {
    installed,
    install: deferredPrompt
      ? async () => {
          const prompt = deferredPrompt;
          deferredPrompt = null;
          await prompt?.prompt();
          notify();
        }
      : null,
  };
}

/** VAPID public key (base64url) to the Uint8Array the Push API expects. */
export function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = window.atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

/** The active service worker registration, registering it on demand. */
export async function getRegistration() {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
}
