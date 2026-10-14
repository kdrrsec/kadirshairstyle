import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { site } from '@/content/site';
import './globals.css';

// Alle lettertypes lokaal meegeleverd (OFL), zodat de build niet afhangt van Google Fonts.
const playfair = localFont({
  src: [
    { path: './fonts/playfair-display-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/playfair-display-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/playfair-display-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/playfair-display-latin-500-italic.woff2', weight: '500', style: 'italic' },
    { path: './fonts/playfair-display-latin-600-italic.woff2', weight: '600', style: 'italic' },
    { path: './fonts/playfair-display-latin-700-italic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-playfair',
  display: 'swap',
});

const jost = localFont({
  src: [
    { path: './fonts/jost-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/jost-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-jost',
  display: 'swap',
});

const poppins = localFont({
  src: [
    { path: './fonts/poppins-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './fonts/poppins-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/poppins-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/poppins-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-poppins',
  display: 'swap',
});

const title = "Kadir's Hairstyle | Service · Quality · Good vibes";
const description =
  "Kadir's Hairstyle, herenkapper in Zutphen voor knippen, baard modelleren en kinderkapsels. Maak vandaag nog online een afspraak.";

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
    'herenkapper Zutphen',
    'barber Zutphen',
    'baard trimmen Zutphen',
    'kinderkapper Zutphen',
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
  themeColor: '#f5f2ec',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${playfair.variable} ${jost.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
