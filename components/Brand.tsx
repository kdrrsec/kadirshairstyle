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
  return (
    <Link href={href} className={className} onClick={onClick} aria-label="Kadir's Hairstyle — naar de homepage">
      <Image
        src={tone === 'light' ? logoLight : logoDark}
        alt="Kadir's Hairstyle"
        className="brand-logo"
        priority={priority}
        sizes="(max-width: 720px) 100px, 160px"
      />
    </Link>
  );
}
