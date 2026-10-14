import type { Metadata } from 'next';
import Image from 'next/image';
import { InstagramIcon, TikTokIcon } from '@/components/SocialIcons';
import { heroImage } from '@/content/images';
import { fullAddress, site } from '@/content/site';
import logoLight from '@/public/logo-light.png';

export const metadata: Metadata = {
  title: 'Binnenkort live',
  robots: { index: false, follow: false },
};

/** Voorbeeld van een "binnenkort live"-pagina. Niet gelinkt vanaf de site. */
export default function BinnenkortPage() {
  const address = fullAddress();
  return (
    <main className="soon">
      <Image src={heroImage.src} alt="" fill priority sizes="100vw" quality={70} className="soon-bg" />
      <div className="soon-overlay" aria-hidden="true" />

      <div className="soon-content">
        <Image src={logoLight} alt={site.name} className="soon-logo" priority sizes="(max-width: 640px) 260px, 380px" />

        <p className="soon-eyebrow">
          <span className="soon-dot" aria-hidden="true" />
          Binnenkort
        </p>
        <h1>
          We gaan <em>binnenkort</em> live
        </h1>
        <p className="soon-text">
          Onze nieuwe website met online afspraak maken is bijna klaar. Tot die tijd ben je van harte welkom in de
          salon.
        </p>

        {address && <p className="soon-address">{address}</p>}

        <div className="soon-socials">
          {site.instagram && (
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon size={18} />
            </a>
          )}
          {site.tiktok && (
            <a href={site.tiktok.url} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TikTokIcon size={18} />
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
