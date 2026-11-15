import { formatMoney, formatPercent } from '@/lib/format';
import { absoluteUrl } from '@/lib/seo';
import { tryApi } from '@/lib/server-api';
import { siteUrl } from '@/lib/site';
import type { ArticlePage, CoinList } from '@/lib/types';

export const dynamic = 'force-dynamic';

const cell = (value: string) => value.replace(/\|/g, '\\|');

/** A live, citation-friendly Markdown snapshot of the market and the wire. */
export async function GET() {
  const [coins, news] = await Promise.all([
    tryApi<CoinList>('/cryptos', { auth: false }),
    tryApi<ArticlePage>('/articles?pageSize=20', { auth: false }),
  ]);
  const now = new Date().toISOString();

  const table = (coins?.items ?? [])
    .slice(0, 20)
    .map(
      (c) =>
        `| ${c.rank ?? '—'} | [${cell(c.name)}](${absoluteUrl('en', { pathname: '/markets/[id]', params: { id: c.id } })}) | ${c.symbol} | ${formatMoney(c.price, 'usd', 'en')} | ${formatPercent(c.change24h, 'en')} | ${formatPercent(c.change7d, 'en')} | ${formatMoney(c.marketCap, 'usd', 'en', { compact: true })} |`,
    )
    .join('\n');

  const headlines = (news?.items ?? [])
    .map((a) => `- [${a.title.replace(/[[\]]/g, '')}](${a.link}): ${a.source}, ${a.lang.toUpperCase()}, ${a.publishedAt}`)
    .join('\n');

  const summary = coins?.summary;
  const body = `# Kryptonews: live snapshot

Generated: ${now}
Source: ${siteUrl()} (market data provided by CoinGecko; headlines © their publishers). Not financial advice.

## Market summary (top 100 cryptocurrencies)
- Total market capitalisation: ${formatMoney(summary?.totalMarketCap ?? null, 'usd', 'en', { compact: true })}
- 24h volume: ${formatMoney(summary?.totalVolume ?? null, 'usd', 'en', { compact: true })}
- Bitcoin dominance: ${summary?.btcDominance != null ? `${summary.btcDominance.toFixed(1)}%` : 'n/a'}
- Coins up / down over 24h: ${summary?.up ?? 'n/a'} / ${summary?.down ?? 'n/a'}

## Top 20 by market capitalisation (USD)
| Rank | Coin | Symbol | Price | 24h | 7d | Market cap |
|---:|---|---|---:|---:|---:|---:|
${table || '| — | Data is loading | — | — | — | — | — |'}

## Latest headlines
${headlines || '- No headline available yet.'}

## About this data
Prices refresh every 2 minutes, news every 10 minutes. Full site map: ${siteUrl()}/llms.txt
`;

  return new Response(body, {
    headers: { 'content-type': 'text/markdown; charset=utf-8', 'cache-control': 'public, max-age=120' },
  });
}
