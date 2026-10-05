import Link from 'next/link';

type LogoProps = {
  tone?: 'dark' | 'light';
  className?: string;
  onClick?: () => void;
};

/** Typografisch woordmerk van Kadir's Hairstyle. */
export function Logo({ tone = 'dark', className = '', onClick }: LogoProps) {
  const color = tone === 'light' ? 'text-ivory' : 'text-ink';
  return (
    <Link href="/#top" onClick={onClick} aria-label="Kadir's Hairstyle — naar de homepage" className={`group inline-flex flex-col leading-none ${color} ${className}`}>
      <span className="font-display text-[1.65rem] tracking-[-0.01em] md:text-[1.85rem]">
        Kadir<span className="italic">&rsquo;s</span>
      </span>
      <span className="mt-1 text-[0.58rem] font-medium uppercase tracking-[0.42em] opacity-80">Hairstyle</span>
    </Link>
  );
}
