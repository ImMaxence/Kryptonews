import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const FONT_DIR = join(process.cwd(), 'src/assets/fonts');

let cache: Promise<{ name: string; data: Buffer; weight: 500 | 600 | 700 | 800; style: 'normal' }[]> | null = null;

/** Static TTFs for Satori (it cannot use the woff2 files next/font serves). */
export function ogFonts() {
  cache ??= Promise.all([
    readFile(join(FONT_DIR, 'GrenzeGotisch-ExtraBold.ttf')).then((data) => ({ name: 'Grenze', data, weight: 800 as const, style: 'normal' as const })),
    readFile(join(FONT_DIR, 'Newsreader-SemiBold.ttf')).then((data) => ({ name: 'Newsreader', data, weight: 600 as const, style: 'normal' as const })),
    readFile(join(FONT_DIR, 'Archivo-ExpandedBold.ttf')).then((data) => ({ name: 'Archivo', data, weight: 700 as const, style: 'normal' as const })),
    readFile(join(FONT_DIR, 'IBMPlexMono-Medium.ttf')).then((data) => ({ name: 'Plex', data, weight: 500 as const, style: 'normal' as const })),
  ]);
  return cache;
}

export const OG = { paper: '#f3eee3', paperDeep: '#e9e1cf', ink: '#16130f', soft: '#4a4338', accent: '#b8360f', up: '#0b6a39', down: '#b0261b' };
export const OG_SIZE = { width: 1200, height: 630 };
