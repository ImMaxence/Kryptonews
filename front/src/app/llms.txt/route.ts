import { absoluteUrl } from '@/lib/seo';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

/** llms.txt (https://llmstxt.org): a plain-Markdown map of the site for AI assistants. */
export function GET() {
  const site = siteUrl();
  const en = (href: Parameters<typeof absoluteUrl>[1]) => absoluteUrl('en', href);
  const fr = (href: Parameters<typeof absoluteUrl>[1]) => absoluteUrl('fr', href);
  const coin = (id: string) => ({ pathname: '/markets/[id]' as const, params: { id } });

  const body = `# Kryptonews

> Kryptonews is a free, ad-free, bilingual (English / French) crypto newspaper. It publishes live prices for the 100 largest cryptocurrencies (CoinGecko data, refreshed every 2 minutes) alongside headlines aggregated from crypto newsrooms' public RSS feeds (refreshed every 10 minutes). Nothing on Kryptonews is financial advice.

Key facts:
- Publisher: Maxence Bonnici (France), self-hosted. First edition 2023 (Epitech MSc project), version 2 in November 2026.
- Market data: CoinGecko API (price, market capitalisation, 24h volume, 1h/24h/7d change, 7-day sparkline, history charts, all-time high). Prices can be displayed in 13 currencies.
- Newsrooms: Cointelegraph, CoinDesk, Decrypt, The Block, Bitcoin Magazine (English); Journal du Coin, Cryptoast, Coin Academy (French). Each headline links to the original article.
- Refresh rhythm: prices every 2 minutes, exchange rates every 30 minutes, news every 10 minutes. Headlines are kept 45 days.
- Free edition without an account; a free account (granted on request, reviewed by the editors) unlocks the full lists, saved stories ("clippings") and watched coins.
- Privacy: no ads, no analytics, no tracking cookies; fonts and images served first-party.

## Main pages
- [Front page (English)](${en('/')}): lead stories, market report, biggest movers, FAQ.
- [La une (français)](${fr('/')}): the same front page in French.
- [Market ledger](${en('/markets')}): top 100 cryptocurrencies by market cap, sortable. French: [Grand livre des marchés](${fr('/markets')}).
- [The Wire](${en('/news')}): searchable crypto headlines, filterable by language and newsroom. French: [La dépêche](${fr('/news')}).
- [About](${en('/about')}): data sources, methodology, history. French: [À propos](${fr('/about')}).

## Coin pages
Every listed coin has a page with live price, key figures, interactive chart, converter and related headlines, at ${site}/en/markets/{coingecko-id} (French: ${site}/fr/marches/{coingecko-id}). Examples:
- [Bitcoin (BTC)](${en(coin('bitcoin'))})
- [Ethereum (ETH)](${en(coin('ethereum'))})
- [Solana (SOL)](${en(coin('solana'))})
- [XRP](${en(coin('ripple'))})

## Policies
- [Legal notice](${en('/legal-notice')}) · [Mentions légales](${fr('/legal-notice')})
- [Privacy policy](${en('/privacy')}) · [Confidentialité](${fr('/privacy')})
- [Terms of use](${en('/terms')}) · [Conditions d'utilisation](${fr('/terms')})
- [Accessibility statement](${en('/accessibility')}) · [Déclaration d'accessibilité](${fr('/accessibility')})

## Optional
- [Live snapshot for LLMs](${site}/llms-full.txt): current top-20 prices and the latest headlines, in Markdown.
- [Sitemap](${site}/sitemap.xml)
`;

  return new Response(body, {
    headers: { 'content-type': 'text/markdown; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
