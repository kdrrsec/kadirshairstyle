import { looks } from '@/content/images';
import { BOOKING_HREF, site } from '@/content/site';
import { Eyebrow } from '../ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { SiteImage } from '../ui/SiteImage';
import { TextLink } from '../ui/TextLink';

/** Compositie per positie: afwisselende verhoudingen, breedtes en verspringingen. */
const layout = [
  { cell: 'col-span-2 lg:col-span-5', frame: 'aspect-[4/5]', sizes: '(min-width: 1024px) 40vw, 100vw' },
  { cell: 'col-span-1 lg:col-span-4 lg:mt-32', frame: 'aspect-[3/4]', sizes: '(min-width: 1024px) 32vw, 50vw' },
  { cell: 'col-span-1 mt-12 lg:col-span-3 lg:mt-10', frame: 'aspect-[2/3]', sizes: '(min-width: 1024px) 24vw, 50vw' },
  { cell: 'col-span-1 lg:col-span-3 lg:mt-24', frame: 'aspect-square', sizes: '(min-width: 1024px) 24vw, 50vw' },
  { cell: 'col-span-1 mt-12 lg:col-span-4 lg:mt-0', frame: 'aspect-[4/5]', sizes: '(min-width: 1024px) 32vw, 50vw' },
  { cell: 'col-span-2 lg:col-span-5 lg:self-end', frame: 'aspect-[16/11]', sizes: '(min-width: 1024px) 40vw, 100vw' },
];

export function Gallery() {
  return (
    <section id="looks" aria-labelledby="looks-title" className="relative bg-ivory py-24 md:py-36 lg:py-44">
      <div className="container-edge">
        <div className="grid grid-cols-1 gap-y-8 md:grid-cols-12 md:items-end md:gap-x-8">
          <Reveal className="md:col-span-8">
            <Eyebrow>Lookbook</Eyebrow>
            <h2 id="looks-title" className="mt-7 text-[3.25rem] leading-[0.92] md:text-[5.5rem] lg:text-[7.5rem]">
              Onze <span className="italic">looks</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-4">
            <p className="max-w-xs text-[1.0625rem] leading-[1.8] text-ink-soft">
              Een selectie van onze looks, styling en resultaten.
            </p>
            {site.instagram ? (
              <TextLink href={site.instagram.url} external arrow="↗" className="mt-6">
                Ontdek onze looks
              </TextLink>
            ) : (
              <TextLink href={BOOKING_HREF} className="mt-6">
                Reserveer jouw look
              </TextLink>
            )}
          </Reveal>
        </div>

        <ul className="mt-16 grid grid-cols-2 items-start gap-x-3 gap-y-10 md:mt-24 md:gap-x-6 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-16">
          {looks.slice(0, layout.length).map((look, i) => (
            <li key={look.src} className={layout[i].cell}>
              <Reveal delay={(i % 3) * 0.08}>
                <figure className="group">
                  <div className={`relative overflow-hidden bg-sand ${layout[i].frame}`}>
                    <SiteImage
                      src={look.src}
                      alt={look.alt}
                      fill
                      sizes={layout[i].sizes}
                      className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-editorial)] group-hover:scale-[1.045]"
                    />
                  </div>
                  <figcaption className="mt-3 flex items-baseline gap-3 md:mt-4">
                    <span className="caps text-stone">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-display text-lg italic text-ink-soft md:text-xl">{look.caption}</span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
