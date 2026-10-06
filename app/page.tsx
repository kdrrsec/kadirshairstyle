import Image from 'next/image';
import Link from 'next/link';
import { Droplets, Leaf, Palette, Scissors, Sparkles, Wind, type LucideIcon } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { StructuredData } from '@/components/StructuredData';
import { heroImage } from '@/content/images';
import { BOOKING_HREF, dayLabels, fullAddress, site, treatments, type DayKey } from '@/content/site';

const ICONS: Record<string, LucideIcon> = {
  knippen: Scissors,
  'wassen-knippen': Droplets,
  'styling-fohnen': Wind,
  kleuren: Palette,
  highlights: Sparkles,
  haarverzorging: Leaf,
};

const DAY_ORDER: DayKey[] = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

function formatEuro(value: number) {
  return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

/** Groepeert opeenvolgende dagen met dezelfde tijden, bijv. "Di – Do: 09:00 – 18:00". */
function openingLines() {
  const lines: string[] = [];
  let i = 0;
  while (i < DAY_ORDER.length) {
    const h = site.hours[DAY_ORDER[i]];
    let j = i;
    while (
      j + 1 < DAY_ORDER.length &&
      JSON.stringify(site.hours[DAY_ORDER[j + 1]]) === JSON.stringify(h)
    ) {
      j++;
    }
    const from = dayLabels[DAY_ORDER[i]].slice(0, 2);
    const to = dayLabels[DAY_ORDER[j]].slice(0, 2);
    const days = i === j ? from : `${from} – ${to}`;
    lines.push(`${days}: ${h ? `${h.open} – ${h.close}` : 'Gesloten'}`);
    i = j + 1;
  }
  return lines;
}

export default function Home() {
  const address = fullAddress();
  const mapsQuery = address ? encodeURIComponent(`${site.name}, ${address}`) : null;

  return (
    <>
      <StructuredData />
      <Navbar />

      <main id="top">
        <section className="hero">
          <div className="hero-bg" aria-hidden="true">
            <Image src={heroImage.src} alt="" fill priority sizes="100vw" quality={80} />
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <p className="eyebrow">Kapsalon · {site.city}</p>
            <h1>
              Welkom bij <em>{site.name}</em>
              <span className="sr-only"> — kapper in {site.city}</span>
            </h1>
            <div className="hero-actions">
              <Link href={BOOKING_HREF} className="btn btn-primary">
                Maak afspraak
              </Link>
              <a href="#diensten" className="btn btn-ghost">
                Bekijk diensten
              </a>
            </div>
          </div>
        </section>

        <section className="section" id="over-ons">
          <div className="container split">
            <div className="split-media" aria-hidden="true">
              <div className="media-frame">
                <svg viewBox="0 0 200 200" className="scissors-art">
                  <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
                  <g transform="translate(100 100)">
                    <path
                      d="M-40 -35 L15 20 M-40 35 L15 -20"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="-45" cy="-35" r="9" fill="none" stroke="currentColor" strokeWidth="4" />
                    <circle cx="-45" cy="35" r="9" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path
                      d="M15 20 L45 30 M15 -20 L45 -30"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>
                </svg>
              </div>
            </div>
            <div className="split-text">
              <p className="eyebrow">Over ons</p>
              <h2>Vakmanschap met een persoonlijke touch</h2>
              <p>
                {site.name} is dé herenkapper in {site.city} voor mannen die een kapsel willen dat echt bij hen past.
                Met oog voor de laatste trends en persoonlijke aandacht zorgen wij voor een resultaat waarmee je met
                vertrouwen de deur uitgaat, of je nu op zoek bent naar een frisse nieuwe look of een vertrouwde stijl.
              </p>
              <p>
                Bij ons ben je aan het juiste adres voor knippen, kleuren, stylen en alles daartussenin. Kwaliteit,
                gezelligheid en aandacht voor de klant staan bij ons voorop.
              </p>
            </div>
          </div>
        </section>

        <section className="section menu-section" id="diensten">
          <div className="container menu-layout">
            <div className="menu-intro">
              <p className="eyebrow">Diensten &amp; prijzen</p>
              <h2>Waar wij je mee kunnen helpen</h2>
              <p>
                Van een frisse coupe tot kleur en verzorging. Kies je behandeling en plan direct online een moment
                dat jou uitkomt.
              </p>
              <Link href={BOOKING_HREF} className="btn btn-primary">
                Maak afspraak
              </Link>
              <p className="menu-note">Prijzen op aanvraag · persoonlijk advies in de salon</p>
            </div>

            <ul className="menu-list">
              {treatments.map((t) => {
                const Icon = ICONS[t.slug] ?? Scissors;
                return (
                  <li key={t.slug}>
                    <Link href={`${BOOKING_HREF}?behandeling=${t.slug}`} className="menu-item">
                      <span className="menu-icon">
                        <Icon strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <div className="menu-text">
                        <h3>{t.name}</h3>
                        <p>{t.description}</p>
                      </div>
                      <span className="menu-meta">
                        <span className="menu-duration">{t.durationMinutes} min</span>
                        {t.priceFrom !== null && <span className="menu-price">€{formatEuro(t.priceFrom)}</span>}
                      </span>
                      <span className="menu-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container split">
            <div className="split-text">
              <p className="eyebrow">Contact</p>
              <h2>Kom langs of maak een afspraak</h2>
              <p>Loop binnen of plan online een afspraak in. We staan voor je klaar.</p>
              <div className="contact-list">
                <div className="contact-item">
                  <span className="contact-label">Adres</span>
                  {address ? <span>{address}</span> : <span className="pending">Adres volgt binnenkort</span>}
                </div>
                <div className="contact-item">
                  <span className="contact-label">Telefoon</span>
                  {site.phone ? (
                    <a href={`tel:${site.phone.href}`}>{site.phone.display}</a>
                  ) : (
                    <span className="pending">Telefoonnummer volgt binnenkort</span>
                  )}
                </div>
                <div className="contact-item">
                  <span className="contact-label">Openingstijden</span>
                  {site.hoursConfirmed ? (
                    <span>
                      {openingLines().map((line, i) => (
                        <span key={line}>
                          {i > 0 && <br />}
                          {line}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="pending">Openingstijden volgen binnenkort</span>
                  )}
                </div>
                {site.instagram && (
                  <div className="contact-item">
                    <span className="contact-label">Instagram</span>
                    <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
                      {site.instagram.handle}
                    </a>
                  </div>
                )}
              </div>
              <div className="contact-actions">
                <Link href={BOOKING_HREF} className="btn btn-primary">
                  Maak afspraak
                </Link>
                {mapsQuery && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                  >
                    Route plannen
                  </a>
                )}
              </div>
            </div>
            <div className="split-media">
              <div className="map-frame">
                {mapsQuery ? (
                  <iframe
                    title={`Locatie ${site.name} ${site.city}`}
                    src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
