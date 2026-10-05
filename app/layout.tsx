import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Jost } from 'next/font/google';
import { MotionProvider } from '@/components/ui/MotionProvider';
import { site } from '@/content/site';
import './globals.css';

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const sans = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
});

const title = "Kapper Zutphen | Kadir's Hairstyle – Kapsalon & haarstylist";
const description =
  "Kadir's Hairstyle is een moderne kapsalon in Zutphen voor knippen, kleuren, highlights, styling en haarverzorging. Persoonlijke aandacht en vakmanschap — reserveer jouw moment online.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s | ${site.name} Zutphen`,
  },
  description,
  keywords: [
    'kapper Zutphen',
    'kapsalon Zutphen',
    "Kadir's Hairstyle Zutphen",
    'haarstylist Zutphen',
    'knippen Zutphen',
    'haar kleuren Zutphen',
    'highlights Zutphen',
  ],
  applicationName: site.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: '/',
    siteName: site.name,
    title,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#faf7f2',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${display.variable} ${sans.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
