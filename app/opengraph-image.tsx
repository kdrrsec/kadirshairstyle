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
          background: '#1b1c1e',
          color: '#f5f2ec',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 22, letterSpacing: 6, color: '#cbb797', fontFamily: 'sans-serif' }}>
          KAPSALON · ZUTPHEN
        </div>
        <div style={{ display: 'flex', fontSize: 92, marginTop: 28 }}>Welkom bij Kadir&rsquo;s Hairstyle</div>
        <div
          style={{
            display: 'flex',
            marginTop: 44,
            padding: '16px 36px',
            borderRadius: 2,
            background: '#f5f2ec',
            color: '#1b1c1e',
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
