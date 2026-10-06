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
          {site.instagram ? (
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          ) : (
            <span>Instagram volgt</span>
          )}
          <span>Website door AxaWeb</span>
        </div>
      </div>
    </footer>
  );
}
