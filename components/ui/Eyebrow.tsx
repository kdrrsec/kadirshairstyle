type EyebrowProps = {
  children: React.ReactNode;
  tone?: 'dark' | 'light';
  className?: string;
};

/** Kleine label-tekst met een fijne lijn ervoor. */
export function Eyebrow({ children, tone = 'dark', className = '' }: EyebrowProps) {
  const color = tone === 'light' ? 'text-champagne' : 'text-mocha';
  const line = tone === 'light' ? 'bg-champagne/60' : 'bg-mocha/50';
  return (
    <p className={`caps flex items-center gap-4 ${color} ${className}`}>
      <span aria-hidden="true" className={`h-px w-8 shrink-0 ${line}`} />
      <span>{children}</span>
    </p>
  );
}
