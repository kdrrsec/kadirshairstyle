import Image from 'next/image';
import Link from 'next/link';
import logoDark from '@/public/logo.png';
import logoLight from '@/public/logo-light.png';

type BrandProps = {
  className?: string;
  href?: string;
  onClick?: () => void;
  /** 'light' voor donkere achtergronden (footer). */
  tone?: 'dark' | 'light';
  priority?: boolean;
};

/** Logo van Kadir's Hairstyle (transparante PNG, donkere en lichte variant). */
export function Brand({ className = 'brand', href = '/#top', onClick, tone = 'dark', priority }: BrandProps) {
  const logo = (
    <Image
      src={tone === 'light' ? logoLight : logoDark}
      alt="Kadir's Hairstyle"
      className="brand-logo"
      priority={priority}
      sizes="(max-width: 720px) 100px, 160px"
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
