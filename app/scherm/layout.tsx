import type { Metadata } from 'next';
import localFont from 'next/font/local';

// Strakke, hoge display-letter die past bij het stencil-logo; goed leesbaar op afstand.
const tv = localFont({
  src: '../fonts/bebas-neue-latin-400-normal.woff2',
  weight: '400',
  variable: '--font-tv',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Wachtrij',
  robots: { index: false, follow: false },
};

export default function SchermLayout({ children }: { children: React.ReactNode }) {
  return <div className={tv.variable}>{children}</div>;
}
