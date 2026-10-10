import Image from 'next/image';
import Link from 'next/link';
import logoDark from '@/public/logo.png';
import logoLight from '@/public/logo-light.png';
import compactDark from '@/public/logo-compact.png';
import compactLight from '@/public/logo-compact-light.png';

type BrandProps = {
  className?: string;
  href?: string;
  onClick?: () => void;
  /** 'light' voor donkere achtergronden (footer). */
  tone?: 'dark' | 'light';
  /** 'compact' zonder slogan, voor kleine plekken zoals de navigatie. */
  variant?: 'full' | 'compact';
  priority?: boolean;
};

/** Logo van Kadir's Hairstyle (transparante PNG, donkere en lichte variant, met of zonder slogan). */
export function Brand({
  className = 'brand',
  href = '/#top',
  onClick,
  tone = 'dark',
  variant = 'full',
  priority,
}: BrandProps) {
  const src = variant === 'compact' ? (tone === 'light' ? compactLight : compactDark) : tone === 'light' ? logoLight : logoDark;
  const logo = (
    <Image
      src={src}
      alt="Kadir's Hairstyle"
      className="brand-logo"
      priority={priority}
      sizes="(max-width: 720px) 260px, 340px"
    />
  );
  const label = "Kadir's Hairstyle — naar de homepage";
  // Ankers binnen de pagina als gewone link, zodat ze ook na een eerdere hash-sprong blijven werken.
  if (href.includes('#')) {
    return (
      <a href={href} className={className} onClick={onClick} aria-label={label}>
        {logo}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick} aria-label={label}>
      {logo}
    </Link>
  );
}
