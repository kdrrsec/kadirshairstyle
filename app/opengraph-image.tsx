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
          justifyContent: 'space-between',
          background: '#1c1b19',
          color: '#f4efe7',
          padding: '72px 80px',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 20, letterSpacing: 6, color: '#c8b495', fontFamily: 'sans-serif' }}>
          KADIR&rsquo;S HAIRSTYLE · ZUTPHEN
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 120, lineHeight: 1 }}>
          <span>Jouw haar.</span>
          <span style={{ fontStyle: 'italic', color: '#c8b495', paddingLeft: 140 }}>Jouw stijl.</span>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: 'rgba(244,239,231,0.7)', fontFamily: 'sans-serif' }}>
          Kapsalon &amp; haarstylist in Zutphen — reserveer jouw moment
        </div>
      </div>
    ),
    size
  );
}
