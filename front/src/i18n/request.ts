import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import * as rootParams from 'next/root-params';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
  let resolved: string | undefined = locale;
  if (!resolved) {
    try {
      resolved = await rootParams.locale();
    } catch {
      resolved = undefined;
    }
  }
  const current = hasLocale(routing.locales, resolved) ? resolved : routing.defaultLocale;

  return {
    locale: current,
    timeZone: 'Europe/Paris',
    messages: (await import(`../../messages/${current}.json`)).default,
  };
});
