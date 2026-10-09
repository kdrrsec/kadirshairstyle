import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wachtrij',
  robots: { index: false, follow: false },
};

export default function SchermLayout({ children }: { children: React.ReactNode }) {
  return children;
}
