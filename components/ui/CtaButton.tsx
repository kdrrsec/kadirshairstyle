import Link from 'next/link';

type CtaButtonProps = {
  href: string;
  children: React.ReactNode;
  tone?: 'dark' | 'light';
  size?: 'md' | 'lg';
  className?: string;
};

/**
 * Primaire merk-CTA: strak, rechthoekig en editorial.
 * Bij hover schuift een champagne vlak in en beweegt het pijltje naar rechts.
 */
export function CtaButton({ href, children, tone = 'dark', size = 'md', className = '' }: CtaButtonProps) {
  const base =
    tone === 'dark'
      ? 'bg-ink text-ivory hover:text-ink before:bg-champagne'
      : 'bg-ivory text-ink hover:text-ink before:bg-champagne';
  const dims = size === 'lg' ? 'min-h-16 px-9 text-[0.8rem]' : 'min-h-14 px-7 text-[0.75rem]';

  return (
    <Link
      href={href}
      className={`group relative isolate inline-flex items-center justify-between gap-10 overflow-hidden whitespace-nowrap rounded-[2px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 ease-[var(--ease-editorial)] before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-500 before:ease-[var(--ease-editorial)] hover:before:scale-x-100 ${base} ${dims} ${className}`}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="inline-block transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1.5">
        →
      </span>
    </Link>
  );
}
