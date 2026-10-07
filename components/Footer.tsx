import Image from 'next/image';
import axawebIcon from '@/public/axaweb-icon.png';
import { site } from '@/content/site';
import { Brand } from './Brand';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Brand className="brand-footer" tone="light" />
        <p>
          &copy; {year} {site.name} {site.city}. Alle rechten voorbehouden.
        </p>
        <div className="socials">
          {site.instagram && (
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          )}
          {site.tiktok && (
            <a href={site.tiktok.url} target="_blank" rel="noopener noreferrer">
              TikTok
            </a>
          )}
          <span className="powered-by">
            Powered by
            <a
              href="https://www.axaweb.nl"
              target="_blank"
              rel="noopener"
              aria-label="AxaWeb (opent in nieuw tabblad)"
              title="Website door AxaWeb"
              className="powered-by-link"
            >
              <Image src={axawebIcon} alt="AxaWeb" width={22} height={22} />
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
