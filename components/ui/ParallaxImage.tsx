'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { SiteImage } from './SiteImage';

type ParallaxImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Hoeveel procent de foto meebeweegt. */
  strength?: number;
  priority?: boolean;
};

/** Grote foto met een zeer subtiele parallax tijdens scrollen. */
export function ParallaxImage({ src, alt, sizes, className = '', strength = 7, priority }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden bg-sand ${className}`}>
      <motion.div style={{ y: reduce ? 0 : y }} className="absolute inset-[-9%_0]">
        <SiteImage src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </motion.div>
    </div>
  );
}
