import Link from 'next/link';

type TextLinkProps = {
  href: string;
  children: React.ReactNode;
  arrow?: '→' | '↗';
  tone?: 'dark' | 'light';
  external?: boolean;
  className?: string;
};

/** Stijlvolle tekstlink met een onderstreping die bij hover opnieuw intekent. */
export function TextLink({ href, children, arrow = '→', tone = 'dark', external, className = '' }: TextLinkProps) {
  const color = tone === 'light' ? 'text-ivory' : 'text-ink';
  const move = arrow === '↗' ? 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5' : 'group-hover:translate-x-1';
  const content = (
    <>
      <span className="relative py-1">
        {children}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px bg-current/40 group-hover:animate-[underline_0.9s_var(--ease-editorial)]"
        />
      </span>
      <span aria-hidden="true" className={`inline-block transition-transform duration-500 ease-[var(--ease-editorial)] ${move}`}>
        {arrow}
      </span>
    </>
  );
  const cls = `group inline-flex items-center gap-2 whitespace-nowrap text-[0.8125rem] font-medium uppercase tracking-[0.16em] ${color} ${className}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}
