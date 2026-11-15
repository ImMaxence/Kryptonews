import { ImageResponse } from 'next/og';
import { OG, ogFonts } from '@/lib/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
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
        <div style={{ fontSize: 140, lineHeight: 1, marginTop: -14 }}>K</div>
        <div style={{ width: 90, height: 10, background: OG.accent, marginTop: -6 }} />
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
