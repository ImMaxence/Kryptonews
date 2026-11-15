import { ImageResponse } from 'next/og';
import { OG, OG_SIZE, ogFonts } from '@/lib/og';
import { siteUrl } from '@/lib/site';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Kryptonews: the crypto ledger, printed live';

const COPY = {
  en: {
    tagline: 'Think forward. The crypto ledger, printed live.',
    columns: ['Top 100 prices · every 2 min', '8 newsrooms · EN & FR', 'Free · no ads · no tracking'],
  },
  fr: {
    tagline: 'Penser en avance. Le journal crypto, imprimé en direct.',
    columns: ['Top 100 des cours · toutes les 2 min', '8 rédactions · FR & EN', 'Gratuit · sans pub · sans pistage'],
  },
};

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const copy = COPY[locale === 'fr' ? 'fr' : 'en'];
  const host = new URL(siteUrl()).host.toUpperCase();

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: OG.paper, color: OG.ink, padding: '44px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Archivo', fontSize: 20, letterSpacing: 3, color: OG.soft }}>
          <span>VOL. II</span>
          <span>{host}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', fontFamily: 'Grenze', fontSize: 190, lineHeight: 1, marginTop: 18 }}>Kryptonews</div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 18 }}>
          <div style={{ height: 6, background: OG.ink }} />
          <div style={{ height: 2, background: OG.ink, marginTop: 4 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', fontFamily: 'Newsreader', fontSize: 46, marginTop: 34 }}>{copy.tagline}</div>
        <div style={{ display: 'flex', marginTop: 'auto', borderTop: `2px solid ${OG.ink}`, paddingTop: 22 }}>
          {copy.columns.map((column, index) => (
            <div
              key={column}
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '0 18px',
                fontFamily: 'Archivo',
                fontSize: 17,
                letterSpacing: 1,
                textTransform: 'uppercase',
                borderLeft: index ? `1px solid ${OG.soft}` : 'none',
                color: index === 2 ? OG.accent : OG.ink,
              }}
            >
              {column}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
