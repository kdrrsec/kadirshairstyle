'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

/**
 * next/image met een rustige, warme achtergrond als fallback,
 * zodat de compositie intact blijft terwijl een foto laadt of ontbreekt.
 */
export function SiteImage({ className = '', alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      alt={alt}
      quality={80}
      {...props}
      onError={() => setFailed(true)}
      className={`${failed ? 'opacity-0' : ''} ${className}`}
    />
  );
}
