import Link from 'next/link';
import { images } from '@/content/images';
import { BOOKING_HREF, site } from '@/content/site';
import { Eyebrow } from '../ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { SiteImage } from '../ui/SiteImage';

export function BookingCta() {
  return (
    <section id="reserveren" aria-labelledby="reserveren-title" className="relative bg-ivory pt-24 md:pt-36 lg:pt-44">
      <div className="container-edge">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-8">
            <Reveal>
              <Eyebrow>
                {site.name} · {site.city}
              </Eyebrow>
              <h2
                id="reserveren-title"
                className="mt-8 text-[3.25rem] leading-[0.92] md:text-[5.75rem] lg:text-[8rem]"
              >
                Klaar voor je <span className="block pl-[10%] italic text-mocha">volgende look?</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-10 max-w-md text-[1.0625rem] leading-[1.8] text-ink-soft md:ml-[10%] md:text-lg">
                Gun jezelf een moment voor een frisse look, professionele verzorging en persoonlijke aandacht.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="hidden md:col-span-3 md:col-start-10 md:block md:self-end">
            <div className="relative aspect-[3/4] overflow-hidden bg-sand">
              <SiteImage src={images.cta.src} alt={images.cta.alt} fill sizes="25vw" className="object-cover" />
            </div>
          </Reveal>
        </div>

        {/* De CTA als onderdeel van de compositie: een volle, typografische band */}
        <Reveal delay={0.1} className="mt-14 md:mt-20">
          <Link
            href={BOOKING_HREF}
            className="group relative isolate flex items-center justify-between gap-6 overflow-hidden border-y border-ink py-8 text-ink transition-colors duration-700 ease-[var(--ease-editorial)] before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-ink before:transition-transform before:duration-700 before:ease-[var(--ease-editorial)] hover:text-ivory hover:before:scale-y-100 md:py-12"
          >
            <span className="caps hidden w-40 shrink-0 text-stone transition-colors duration-700 group-hover:text-champagne md:block md:pl-6">
              Online reserveren
            </span>
            <span className="font-display text-[2.25rem] leading-none sm:text-[3rem] md:flex-1 md:text-[4.5rem] lg:text-[5.5rem]">
              Reserveer jouw <span className="italic">moment</span>
            </span>
            <span
              aria-hidden="true"
              className="pr-1 font-display text-[2.25rem] leading-none transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:translate-x-2 md:pr-6 md:text-[4.5rem] lg:text-[5.5rem]"
            >
              →
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
