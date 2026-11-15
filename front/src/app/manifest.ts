import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Kryptonews: the crypto ledger, printed live',
    short_name: 'Kryptonews',
    description: 'Live prices for the top 100 cryptocurrencies and crypto headlines, in English and French.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    background_color: '#f3eee3',
    theme_color: '#16130f',
    lang: 'fr',
    dir: 'ltr',
    categories: ['finance', 'news'],
    icons: [
      { src: '/icon/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon/maskable', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Marchés · Markets', short_name: 'Markets', url: '/markets', icons: [{ src: '/icon/192', sizes: '192x192', type: 'image/png' }] },
      { name: 'La dépêche · The Wire', short_name: 'News', url: '/news', icons: [{ src: '/icon/192', sizes: '192x192', type: 'image/png' }] },
    ],
    screenshots: [
      { src: '/pwa/screenshot-wide.jpg', sizes: '1440x900', type: 'image/jpeg', form_factor: 'wide', label: 'Kryptonews front page' },
      { src: '/pwa/screenshot-narrow.jpg', sizes: '780x1688', type: 'image/jpeg', form_factor: 'narrow', label: 'Kryptonews night edition on mobile' },
    ],
  };
}
