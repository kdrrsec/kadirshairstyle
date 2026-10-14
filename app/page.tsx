import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { SocialVideos } from '@/components/SocialVideos';
import { StructuredData } from '@/components/StructuredData';
import { heroImage } from '@/content/images';
import logoLight from '@/public/logo-light.png';
import { HandHeart, Scissors, Sparkles } from 'lucide-react';
import { BOOKING_HREF, dayLabels, fullAddress, site, treatments, type DayKey } from '@/content/site';
import { CtaInner } from '@/components/CtaInner';

const DAY_ORDER: DayKey[] = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

function formatEuro(value: number) {
  const whole = Number.isInteger(value);
  return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(value);
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
              <Link href={BOOKING_HREF} className="cta cta-light cta-lg">
                <CtaInner>Maak afspraak</CtaInner>
              </Link>
              <a href="#diensten" className="cta cta-glass cta-lg">
                <CtaInner>Bekijk diensten</CtaInner>
              </a>
            </div>
          </div>
        </section>

        <section className="section" id="over-ons">
          <div className="container split">
            <div className="split-media">
              <div className="about-panel">
                <Image src={logoLight} alt="" className="about-panel-logo" sizes="260px" />
                <ul className="about-values">
                  <li>
                    <span className="about-value-icon">
                      <HandHeart size={20} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>Service</strong>
                      Persoonlijk advies en de tijd voor jou, elke afspraak opnieuw.
                    </span>
                  </li>
                  <li>
                    <span className="about-value-icon">
                      <Scissors size={20} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>Quality</strong>
                      Strakke fades, scherpe lijnen en een coupe die blijft zitten.
                    </span>
                  </li>
                  <li>
                    <span className="about-value-icon">
                      <Sparkles size={20} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>Good vibes</strong>
                      Een ontspannen sfeer waar je graag even binnenloopt.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="split-text">
              <p className="eyebrow">Over ons</p>
              <h2>Meer dan een knipbeurt</h2>
              <p>
                {site.name} is dé herenkapper in {site.city} voor mannen die een kapsel willen dat echt bij hen past.
                Met oog voor de laatste trends en persoonlijke aandacht zorgen wij voor een resultaat waarmee je met
                vertrouwen de deur uitgaat, of je nu op zoek bent naar een frisse nieuwe look of een vertrouwde stijl.
              </p>
              <p>
                Bij ons ben je aan het juiste adres voor een strakke knipbeurt, een verzorgde baard of allebei. Ook
                de jongste heren zijn welkom. Kwaliteit, gezelligheid en aandacht voor de klant staan bij ons voorop.
              </p>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="diensten">
          <div className="container svc2">
            <div className="svc2-media">
              <Image
                src={heroImage.src}
                alt="Werkplek met ringlamp en kappersstoel bij Kadir's Hairstyle"
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
                quality={70}
                className="svc2-photo"
              />
              <div className="svc2-card">
                <p>Weet je wat je wilt?</p>
                <Link href={BOOKING_HREF} className="cta cta-light">
                  <CtaInner>Maak direct je afspraak</CtaInner>
                </Link>
              </div>
            </div>

            <div className="svc2-content">
              <p className="eyebrow">Diensten</p>
              <h2>Waar wij je mee kunnen helpen</h2>
              <p className="svc2-intro">
                Van een frisse coupe tot een strak gemodelleerde baard. Elke afspraak duurt 30 minuten: kies je dienst
                en plan direct online een moment dat jou uitkomt.
              </p>

              <ol className="svc2-list">
                {treatments.map((t) => (
                  <li key={t.slug} className="svc2-item">
                    <span className="svc2-tag">{t.tag}</span>
                    <span className="svc2-name">
                      {t.name.split('&').map((part, j) => (
                        <Fragment key={j}>
                          {j > 0 && <span className="amp">&amp;</span>}
                          {part}
                        </Fragment>
                      ))}
                    </span>
                    <span className="svc2-desc">{t.description}</span>
                    {t.priceFrom !== null && <span className="svc2-price">€{formatEuro(t.priceFrom)}</span>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <SocialVideos />

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
                <Link href={BOOKING_HREF} className="cta cta-dark">
                  <CtaInner>Maak afspraak</CtaInner>
                </Link>
                {mapsQuery && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta cta-soft"
                  >
                    <CtaInner>Route plannen</CtaInner>
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
