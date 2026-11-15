import { ImageResponse } from 'next/og';
import { formatMoney, formatPercent } from '@/lib/format';
import { OG, OG_SIZE, ogFonts } from '@/lib/og';
import { getCoin } from '@/lib/server-api';
import { siteUrl } from '@/lib/site';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Kryptonews coin card';

function sparkPath(data: number[], width: number, height: number) {
  if (data.length < 2) return '';
  const min = Math.min(...data);
  const span = Math.max(...data) - min || 1;
  return data
    .map((v, i) => `${i ? 'L' : 'M'}${((i / (data.length - 1)) * width).toFixed(1)},${(height - ((v - min) / span) * height).toFixed(1)}`)
    .join(' ');
}

export default async function CoinOpenGraphImage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  // A social card must always render: fall back to the generic card if the API is unavailable.
  const coin = (await getCoin(id).catch(() => null))?.item;
  const fr = locale === 'fr';
  const change = coin?.change24h ?? 0;
  const color = change >= 0 ? OG.up : OG.down;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: OG.paper, color: OG.ink, padding: '40px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `6px solid ${OG.ink}`, paddingBottom: 12 }}>
          <span style={{ fontFamily: 'Grenze', fontSize: 64, lineHeight: 1 }}>Kryptonews</span>
          <span style={{ fontFamily: 'Archivo', fontSize: 22, letterSpacing: 3, color: OG.accent }}>{fr ? 'MARCHÉS' : 'MARKETS'}</span>
        </div>
        {coin ? (
          <div style={{ display: 'flex', flex: 1, marginTop: 36 }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontFamily: 'Archivo', fontSize: 24, letterSpacing: 3, color: OG.soft }}>
                {fr ? `RANG N° ${coin.rank ?? '—'}` : `RANK #${coin.rank ?? '—'}`} · {coin.symbol}
              </span>
              <span style={{ fontFamily: 'Newsreader', fontSize: 104, lineHeight: 1.02, marginTop: 10 }}>{coin.name}</span>
              <span style={{ fontFamily: 'Plex', fontSize: 84, marginTop: 24 }}>{formatMoney(coin.price, 'usd', locale)}</span>
              <span style={{ display: 'flex', alignItems: 'center', fontFamily: 'Plex', fontSize: 40, color, marginTop: 8 }}>
                <svg width="30" height="26" viewBox="0 0 30 26" style={{ marginRight: 14 }}>
                  <path d={change >= 0 ? 'M15 0 L30 26 L0 26 Z' : 'M0 0 L30 0 L15 26 Z'} fill={color} />
                </svg>
                {formatPercent(change, locale)} · 24h
              </span>
            </div>
            <svg width="360" height="300" viewBox="-4 -4 368 308" style={{ marginTop: 40 }}>
              <path d={sparkPath(coin.sparkline, 360, 300)} fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', fontFamily: 'Newsreader', fontSize: 72 }}>{fr ? 'Grand livre des marchés' : 'The market ledger'}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32, borderTop: `2px solid ${OG.ink}`, paddingTop: 16, fontFamily: 'Archivo', fontSize: 15, letterSpacing: 1.5, color: OG.soft }}>
          <span>{new URL(siteUrl()).host.toUpperCase()}</span>
          <span>{fr ? 'DONNÉES COINGECKO · PAS UN CONSEIL EN INVESTISSEMENT' : 'DATA: COINGECKO · NOT FINANCIAL ADVICE'}</span>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
