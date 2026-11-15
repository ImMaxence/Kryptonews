import { ImageResponse } from 'next/og';
import { OG, ogFonts } from '@/lib/og';

export const contentType = 'image/png';

const SIZES = [48, 192, 512] as const;

export function generateImageMetadata() {
  return [
    ...SIZES.map((size) => ({ id: String(size), size: { width: size, height: size }, contentType })),
    // Android adaptive icons crop to a circle: keep the monogram inside the 80% safe zone.
    { id: 'maskable', size: { width: 512, height: 512 }, contentType },
  ];
}

/** Blackletter "K" on ink, with the accent rule: the Kryptonews monogram. */
export default async function Icon({ id }: { id: Promise<string> }) {
  const key = await id;
  const maskable = key === 'maskable';
  const size = maskable ? 512 : Number(key) || 48;
  const glyph = maskable ? 0.5 : 0.78;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: OG.ink,
          color: OG.paper,
          fontFamily: 'Grenze',
        }}
      >
        <div style={{ fontSize: size * glyph, lineHeight: 1, marginTop: -size * 0.08 * (glyph / 0.78) }}>K</div>
        <div style={{ width: size * glyph * 0.64, height: Math.max(2, size * 0.06 * (glyph / 0.78)), background: OG.accent, marginTop: -size * 0.04 * (glyph / 0.78) }} />
      </div>
    ),
    { width: size, height: size, fonts: await ogFonts() },
  );
}
