import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = "Kadir's Hairstyle — kapper in Zutphen";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), 'public/logo-light.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

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
          fontFamily: 'sans-serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={562} height={281} alt="" />
        <div style={{ display: 'flex', marginTop: 40, fontSize: 26, letterSpacing: 6, color: '#d6c4a6' }}>
          KAPPER · ZUTPHEN · ONLINE AFSPRAAK MAKEN
        </div>
      </div>
    ),
    size
  );
}
