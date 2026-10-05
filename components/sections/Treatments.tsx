import Link from 'next/link';
import { images } from '@/content/images';
import { BOOKING_HREF, treatments } from '@/content/site';
import { CtaButton } from '../ui/CtaButton';
import { Eyebrow } from '../ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { SiteImage } from '../ui/SiteImage';

export function Treatments() {
  return (
    <section
      id="behandelingen"
      aria-labelledby="behandelingen-title"
      className="relative bg-cream py-24 md:py-36 lg:py-44"
    >
      <div className="container-edge">
        <div className="grid grid-cols-1 gap-y-8 md:grid-cols-12 md:gap-x-8">
          <Reveal className="md:col-span-7">
            <Eyebrow>Behandelingen</Eyebrow>
            <h2 id="behandelingen-title" className="mt-7 text-[2.9rem] leading-[0.95] md:text-[4.5rem] lg:text-[6rem]">
              Onze <span className="italic">behandelingen</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-4 md:col-start-9 md:self-end">
            <p className="max-w-sm text-[1.0625rem] leading-[1.8] text-ink-soft">
              Elke behandeling begint met een kort gesprek over jouw haar, je wensen en wat bij je past. Kies hieronder
              waar je voor komt.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 md:mt-24 lg:grid-cols-12 lg:gap-x-8">
          <div className="hidden lg:col-span-4 lg:block">
            <Reveal className="sticky top-28">
              <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                <SiteImage
                  src={images.treatments.src}
                  alt={images.treatments.alt}
                  fill
                  sizes="30vw"
                  className="object-cover"
                />
              </div>
              <p className="caps mt-4 text-stone">Vakwerk, tot in het detail</p>
            </Reveal>
          </div>

          <ol className="border-t border-ink/15 lg:col-span-8 lg:col-start-5">
            {treatments.map((t, i) => (
              <li key={t.slug} className="border-b border-ink/15">
                <Reveal offset={16} delay={i * 0.04}>
                  <Link
                    href={`${BOOKING_HREF}?behandeling=${t.slug}`}
                    className="group grid grid-cols-[2.75rem_1fr_auto] items-baseline gap-x-3 py-7 md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,16rem)_2rem] md:gap-x-6 md:py-9"
                  >
                    <span className="caps text-stone">{String(i + 1).padStart(2, '0')} —</span>
                    <div>
                      <h3 className="text-[2rem] leading-none transition-[transform,color] duration-700 ease-[var(--ease-editorial)] group-hover:translate-x-3 group-hover:text-mocha md:text-[3rem] lg:text-[3.4rem]">
                        {t.name}
                      </h3>
                      <span className="mt-3 block text-sm leading-relaxed text-stone md:hidden">{t.description}</span>
                    </div>
                    <span className="hidden text-sm leading-relaxed text-stone md:block">{t.description}</span>
                    <span
                      aria-hidden="true"
                      className="text-lg text-ink/40 transition-all duration-500 ease-[var(--ease-editorial)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink md:opacity-0 md:group-hover:opacity-100"
                    >
                      ↗
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        <Reveal className="mt-14 flex flex-col gap-6 md:mt-20 md:flex-row md:items-center md:justify-end md:gap-10">
          <p className="text-sm text-stone">Twijfel je wat je nodig hebt? We adviseren je graag in de salon.</p>
          <CtaButton href={BOOKING_HREF}>Ontdek de mogelijkheden</CtaButton>
        </Reveal>
      </div>
    </section>
  );
}
