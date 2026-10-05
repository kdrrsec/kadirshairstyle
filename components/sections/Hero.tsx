'use client';

import { motion } from 'framer-motion';
import { images } from '@/content/images';
import { BOOKING_HREF, site } from '@/content/site';
import { CtaButton } from '../ui/CtaButton';
import { TextLink } from '../ui/TextLink';
import { SiteImage } from '../ui/SiteImage';

const ease = [0.22, 1, 0.36, 1] as const;

function Line({ children, delay, className = '' }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <span className={`block overflow-hidden pb-[0.08em] ${className}`}>
      <motion.span
        className="block"
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.2, ease, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden bg-ivory grain">
      <div className="container-edge grid min-h-[100svh] grid-cols-1 lg:grid-cols-12 lg:gap-x-8">
        {/* Tekst */}
        <div className="relative z-10 flex flex-col pt-32 md:pt-40 lg:col-span-6 lg:pb-16 lg:pt-44 xl:pt-48">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="caps flex items-center gap-4 text-mocha"
          >
            <span aria-hidden="true" className="h-px w-8 bg-mocha/50" />
            {site.name} · {site.city}
          </motion.p>

          <h1
            id="hero-title"
            className="mt-7 text-[3.6rem] leading-[0.9] text-ink sm:text-[4.75rem] md:mt-9 md:text-[6rem] lg:text-[clamp(5.5rem,8.4vw,9.25rem)]"
          >
            <span className="sr-only">{site.name}, kapper in {site.city}. </span>
            <Line delay={0.2}>Jouw haar.</Line>
            <Line delay={0.35} className="pl-[14%] italic text-mocha lg:pl-[18%]">
              Jouw stijl.
            </Line>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease, delay: 0.65 }}
            className="mt-10 max-w-[26rem] md:mt-14 lg:mt-auto lg:max-w-[22rem] xl:ml-[18%]"
          >
            <p className="text-[1.0625rem] leading-relaxed text-ink-soft md:text-lg">
              Professionele haarverzorging en styling in Zutphen, met persoonlijke aandacht voor jouw uitstraling.
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-9 sm:gap-y-5">
              <CtaButton href={BOOKING_HREF}>Reserveer jouw moment</CtaButton>
              <TextLink href="/#behandelingen" className="self-start sm:self-auto">
                Bekijk behandelingen
              </TextLink>
            </div>
          </motion.div>
        </div>

        {/* Beeld */}
        <div className="relative mt-16 pb-16 lg:col-span-6 lg:mt-24 lg:pb-0">
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease }}
            className="relative ml-[12%] aspect-[4/5] overflow-hidden bg-sand sm:ml-[22%] lg:-mr-10 xl:-mr-[calc(3.5rem+max(0px,(100vw-88rem)/2))] lg:ml-0 lg:aspect-auto lg:h-full lg:min-h-[40rem]"
          >
            <SiteImage
              src={images.hero.src}
              alt={images.hero.alt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 88vw"
              className="object-cover"
            />
            <p className="caps absolute bottom-5 right-5 text-ivory/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.35)]">
              Salon · {site.city}
            </p>
          </motion.div>

          {/* Detailfoto die over de hoofdfoto valt */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, ease, delay: 0.55 }}
            className="absolute bottom-6 left-0 w-[42%] border-[6px] border-ivory bg-sand sm:w-[34%] md:border-[10px] lg:bottom-16 lg:-left-[10%] lg:w-[30%]"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <SiteImage
                src={images.heroDetail.src}
                alt={images.heroDetail.alt}
                fill
                sizes="(min-width: 1024px) 18vw, 40vw"
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
