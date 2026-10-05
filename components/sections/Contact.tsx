import { MapPin } from 'lucide-react';
import { BOOKING_HREF, dayLabels, fullAddress, site, type DayKey } from '@/content/site';
import { Eyebrow } from '../ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { TextLink } from '../ui/TextLink';

const DAY_ORDER: DayKey[] = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

function Pending({ children }: { children: React.ReactNode }) {
  return <span className="italic text-stone">{children}</span>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 border-b border-ink/12 py-6 sm:grid-cols-[9rem_1fr] sm:gap-6">
      <dt className="caps pt-1 text-mocha">{label}</dt>
      <dd className="text-[1.0625rem] leading-relaxed text-ink">{children}</dd>
    </div>
  );
}

export function Contact() {
  const address = fullAddress();
  const mapsQuery = address ? encodeURIComponent(`${site.name}, ${address}`) : null;

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative bg-ivory py-24 md:py-36">
      <div className="container-edge grid grid-cols-1 gap-y-14 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-5">
          <Reveal>
            <Eyebrow>Contact</Eyebrow>
            <h2 id="contact-title" className="mt-7 text-[2.6rem] leading-[0.98] md:text-[3.75rem]">
              Kom langs in <span className="italic">{site.city}</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <dl className="mt-12 border-t border-ink/12">
              <Row label="Adres">
                {address ? (
                  <address className="not-italic">
                    {site.address!.street}
                    <br />
                    {site.address!.postalCode} {site.city}
                  </address>
                ) : (
                  <Pending>Adres volgt binnenkort · {site.city}</Pending>
                )}
              </Row>

              <Row label="Telefoon">
                {site.phone ? (
                  <a href={`tel:${site.phone.href}`} className="transition-colors hover:text-mocha">
                    {site.phone.display}
                  </a>
                ) : (
                  <Pending>Telefoonnummer volgt binnenkort</Pending>
                )}
              </Row>

              <Row label="Openingstijden">
                {site.hoursConfirmed ? (
                  <ul className="space-y-1.5">
                    {DAY_ORDER.map((d) => {
                      const h = site.hours[d];
                      return (
                        <li key={d} className="flex justify-between gap-6 text-[0.95rem]">
                          <span className="text-ink-soft">{dayLabels[d]}</span>
                          <span className={h ? 'tabular-nums' : 'text-stone'}>
                            {h ? `${h.open} – ${h.close}` : 'Gesloten'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <Pending>Openingstijden volgen binnenkort</Pending>
                )}
              </Row>

              <Row label="Instagram">
                {site.instagram ? (
                  <a
                    href={site.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-mocha"
                  >
                    {site.instagram.handle} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <Pending>Instagram volgt binnenkort</Pending>
                )}
              </Row>

              <Row label="Route">
                {mapsQuery ? (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-mocha"
                  >
                    Plan je route <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <Pending>Routebeschrijving volgt binnenkort</Pending>
                )}
              </Row>
            </dl>

            <TextLink href={BOOKING_HREF} className="mt-10">
              Reserveer jouw moment
            </TextLink>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="lg:col-span-6 lg:col-start-7 lg:pt-20">
          {mapsQuery ? (
            <div className="relative aspect-[4/5] overflow-hidden bg-sand sm:aspect-[4/3] lg:aspect-[5/6]">
              <iframe
                title={`Locatie van ${site.name} in ${site.city} op Google Maps`}
                src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                className="absolute inset-0 h-full w-full border-0 grayscale-[0.55] contrast-[1.05]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="relative flex aspect-[4/5] flex-col items-center justify-center overflow-hidden bg-sand px-8 text-center sm:aspect-[4/3] lg:aspect-[5/6]">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgb(28_27_25/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(28_27_25/0.06)_1px,transparent_1px)] [background-size:48px_48px]"
              />
              <MapPin aria-hidden="true" strokeWidth={1.2} className="relative h-6 w-6 text-mocha" />
              <p className="relative mt-5 font-display text-2xl text-ink">{site.city}</p>
              <p className="relative mt-2 max-w-xs text-sm text-stone">
                De kaart van Google Maps verschijnt hier zodra het adres bekend is.
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
