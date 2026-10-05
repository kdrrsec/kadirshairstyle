import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import { site } from '@/content/site';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

const title = "Kadir's Hairstyle | Kapper & Kapsalon in Zutphen";
const description =
  "Kadir's Hairstyle in Zutphen, kapsalon voor knippen, kleuren, highlights en styling. Maak vandaag nog online een afspraak.";

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
  themeColor: '#f5f2ec',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${playfair.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
