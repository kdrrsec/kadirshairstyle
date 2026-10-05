import { images } from '@/content/images';
import { BOOKING_HREF } from '@/content/site';
import { CtaButton } from '../ui/CtaButton';
import { Eyebrow } from '../ui/Eyebrow';
import { ParallaxImage } from '../ui/ParallaxImage';
import { Reveal } from '../ui/Reveal';

const moments = [
  { title: 'Persoonlijke aandacht', text: 'Een gesprek over jou, je haar en wat je wilt uitstralen.' },
  { title: 'Een ontspannen sfeer', text: 'Even niets hoeven. Gewoon plaatsnemen en genieten.' },
  { title: 'Met vertrouwen naar buiten', text: 'Een resultaat dat klopt — vandaag en de weken erna.' },
];

export function Experience() {
  return (
    <section
      id="ervaring"
      aria-labelledby="ervaring-title"
      className="relative overflow-hidden bg-night py-24 text-ivory md:py-36 lg:py-0"
    >
      <div className="container-edge grid grid-cols-1 gap-y-16 lg:grid-cols-12 lg:gap-x-8">
        <Reveal className="lg:col-span-6 lg:-ml-10 xl:-ml-[calc(3.5rem+max(0px,(100vw-88rem)/2))]">
          <ParallaxImage
            src={images.experience.src}
            alt={images.experience.alt}
            sizes="(min-width: 1024px) 55vw, 100vw"
            strength={9}
            className="aspect-[4/5] md:aspect-[16/12] lg:aspect-auto lg:h-full lg:min-h-[52rem]"
          />
        </Reveal>

        <div className="flex flex-col justify-center lg:col-span-5 lg:col-start-8 lg:py-44">
          <Reveal>
            <Eyebrow tone="light">De ervaring</Eyebrow>
            <h2 id="ervaring-title" className="mt-8 text-[3rem] leading-[0.95] md:text-[4.75rem] lg:text-[5.5rem]">
              Even tijd
              <br />
              <span className="italic text-champagne">voor jezelf.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-9 max-w-[30rem] text-[1.0625rem] leading-[1.85] text-ivory/70 md:text-lg">
              Een bezoek aan Kadir&rsquo;s Hairstyle draait om meer dan alleen je haar. Persoonlijke aandacht, een
              ontspannen sfeer en een resultaat waarmee je met vertrouwen de deur uitgaat.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <ol className="mt-14 border-t border-ivory/12">
              {moments.map((m, i) => (
                <li key={m.title} className="grid grid-cols-[2.75rem_1fr] gap-x-3 border-b border-ivory/12 py-6">
                  <span className="caps pt-1.5 text-champagne/70">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-[1.6rem] leading-tight">{m.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ivory/55">{m.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.2} className="mt-12">
            <CtaButton href={BOOKING_HREF} tone="light">
              Reserveer jouw moment
            </CtaButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
