import { images } from '@/content/images';
import { Eyebrow } from '../ui/Eyebrow';
import { ParallaxImage } from '../ui/ParallaxImage';
import { Reveal } from '../ui/Reveal';
import { TextLink } from '../ui/TextLink';

const values = [
  { title: 'Persoonlijk advies', text: 'We luisteren eerst. Pas dan pakken we de schaar.' },
  { title: 'Vakmanschap', text: 'Precisie in elke lijn, van coupe tot kleur.' },
  { title: 'Tijd en rust', text: 'Geen haast — wel een resultaat dat klopt.' },
];

export function About() {
  return (
    <section id="over-ons" aria-labelledby="over-ons-title" className="relative bg-ivory py-24 md:py-36 lg:py-44">
      <div className="container-edge grid grid-cols-1 gap-y-14 md:grid-cols-12 md:gap-x-8">
        <Reveal className="md:col-span-6 lg:col-span-5">
          <ParallaxImage
            src={images.about.src}
            alt={images.about.alt}
            sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
            className="aspect-[4/5] w-[88%] md:w-full md:aspect-[3/4]"
          />
        </Reveal>

        <div className="md:col-span-6 md:pt-24 lg:col-span-6 lg:col-start-7 lg:pt-56">
          <Reveal>
            <Eyebrow>Over Kadir&rsquo;s Hairstyle</Eyebrow>
            <h2 id="over-ons-title" className="mt-7 text-[2.75rem] leading-[0.98] md:text-[3.5rem] lg:text-[4.75rem]">
              Meer dan alleen <span className="italic text-mocha">een knipbeurt.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-[34rem] text-[1.0625rem] leading-[1.8] text-ink-soft md:mt-10 md:text-lg">
              Bij Kadir&rsquo;s Hairstyle draait het om persoonlijke aandacht, vakmanschap en een kapsel dat echt bij
              je past. Van een frisse nieuwe coupe tot professionele styling: we nemen de tijd om samen tot het beste
              resultaat te komen.
            </p>
            <TextLink href="/#looks" arrow="↗" className="mt-10">
              Ontdek Kadir&rsquo;s Hairstyle
            </TextLink>
          </Reveal>

          <Reveal delay={0.15}>
            <dl className="mt-16 grid gap-0 border-t border-ink/12 sm:grid-cols-3 md:mt-20">
              {values.map((v, i) => (
                <div
                  key={v.title}
                  className={`border-b border-ink/12 py-6 sm:border-b-0 sm:py-7 ${i > 0 ? 'sm:border-l sm:pl-6' : ''} sm:pr-6`}
                >
                  <dt className="font-display text-xl text-ink">{v.title}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-stone">{v.text}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
