import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

// Assistants and AI search crawlers are explicitly welcome ("AI SEO" / generative engine optimisation).
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'DuckAssistBot',
  'MistralAI-User',
  'meta-externalagent',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  const site = siteUrl();
  const privatePaths = ['/api/'];
  for (const locale of routing.locales) {
    for (const href of ['/account', '/favorites', '/admin'] as const) {
      privatePaths.push(getPathname({ locale, href }));
    }
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: privatePaths },
      { userAgent: AI_CRAWLERS, allow: ['/', '/llms.txt', '/llms-full.txt'], disallow: privatePaths },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
