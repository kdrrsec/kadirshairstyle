import { ImageResponse } from 'next/og';

export const alt = "Kadir's Hairstyle — kapsalon in Zutphen";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
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
          background: '#2b1a10',
          color: '#f8f2e9',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 22, letterSpacing: 6, color: '#e0c28f', fontFamily: 'sans-serif' }}>
          KAPSALON · ZUTPHEN
        </div>
        <div style={{ display: 'flex', fontSize: 92, marginTop: 28 }}>Welkom bij Kadir&rsquo;s Hairstyle</div>
        <div
          style={{
            display: 'flex',
            marginTop: 44,
            padding: '16px 36px',
            borderRadius: 8,
            background: '#c89b5c',
            color: '#2b1a10',
            fontSize: 26,
            fontFamily: 'sans-serif',
          }}
        >
          Maak online een afspraak
        </div>
      </div>
    ),
    size
  );
}
