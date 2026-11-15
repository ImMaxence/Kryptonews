// Fails if messages/fr.json and messages/en.json do not expose exactly the same keys.
import { readFileSync } from 'node:fs';

const load = (locale) => JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8'));
const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );

const en = new Set(flatten(load('en')));
const fr = new Set(flatten(load('fr')));
const missingInFr = [...en].filter((key) => !fr.has(key));
const missingInEn = [...fr].filter((key) => !en.has(key));

if (missingInFr.length || missingInEn.length) {
  if (missingInFr.length) console.error('Missing in fr.json:', missingInFr);
  if (missingInEn.length) console.error('Missing in en.json:', missingInEn);
  process.exit(1);
}
console.log(`i18n OK: ${en.size} keys in both locales`);
