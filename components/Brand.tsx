import Link from 'next/link';

type BrandProps = {
  className?: string;
  href?: string;
  onClick?: () => void;
};

/** Woordmerk van Kadir's Hairstyle (vervangt het logo zolang er geen logobestand is). */
export function Brand({ className = 'brand', href = '/#top', onClick }: BrandProps) {
  return (
    <Link href={href} className={`${className} brand-text`} onClick={onClick} aria-label="Kadir's Hairstyle">
      <span className="brand-name">Kadir&rsquo;s</span>
      <span className="brand-sub">Hairstyle</span>
    </Link>
  );
}
