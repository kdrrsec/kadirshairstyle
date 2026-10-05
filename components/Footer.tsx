import Link from 'next/link';
import { BOOKING_HREF, navItems, site } from '@/content/site';
import { Logo } from './ui/Logo';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night text-ivory">
      <div className="container-edge grid grid-cols-2 gap-x-8 gap-y-12 pb-10 pt-20 md:grid-cols-12 md:pt-24">
        <div className="col-span-2 md:col-span-5">
          <Logo tone="light" />
          <p className="caps mt-5 text-ivory/50">{site.city}</p>
          <Link
            href={BOOKING_HREF}
            className="group mt-10 inline-flex items-center gap-3 font-display text-2xl text-ivory transition-colors hover:text-champagne md:text-3xl"
          >
            Reserveer jouw <span className="italic">moment</span>
            <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">
              →
            </span>
          </Link>
        </div>

        <nav aria-label="Footernavigatie" className="md:col-span-3 md:col-start-7">
          <p className="caps text-champagne/70">Navigatie</p>
          <ul className="mt-5 space-y-2.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[0.95rem] text-ivory/75 transition-colors hover:text-ivory">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="caps text-champagne/70">Social</p>
          <ul className="mt-5 space-y-2.5">
            <li>
              {site.instagram ? (
                <a
                  href={site.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.95rem] text-ivory/75 transition-colors hover:text-ivory"
                >
                  Instagram <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="text-[0.95rem] text-ivory/45">Instagram (volgt)</span>
              )}
            </li>
          </ul>
        </div>

        <div className="col-span-2 mt-8 flex flex-col gap-3 border-t border-ivory/10 pt-8 text-xs text-ivory/45 md:col-span-12 md:flex-row md:justify-between">
          <p>&copy; {year} {site.name}. Alle rechten voorbehouden.</p>
          <p className="tracking-wide text-ivory/35">Website door AxaWeb</p>
        </div>
      </div>
    </footer>
  );
}
