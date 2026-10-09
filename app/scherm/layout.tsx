import type { Metadata } from 'next';
import { Bebas_Neue } from 'next/font/google';

// Strakke, hoge display-letter die past bij het stencil-logo; goed leesbaar op afstand.
const tv = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-tv', display: 'swap' });

export const metadata: Metadata = {
  title: 'Wachtrij',
  robots: { index: false, follow: false },
};

export default function SchermLayout({ children }: { children: React.ReactNode }) {
  return <div className={tv.variable}>{children}</div>;
}
