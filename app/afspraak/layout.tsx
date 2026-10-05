import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maak een afspraak',
  description:
    "Reserveer online je afspraak bij Kadir's Hairstyle in Zutphen. Kies je behandeling, dag en tijd — in een paar stappen geregeld.",
  alternates: { canonical: '/afspraak' },
};

export default function AfspraakLayout({ children }: { children: React.ReactNode }) {
  return children;
}
