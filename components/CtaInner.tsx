import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Binnenkant van een pilknop (zelfde knop als Bus4Rent): een gevulde pil met
 * een dunne rand eromheen. In rust staat de pijl in de pil; bij hover krimpt
 * de pil en krijgt de pijl een eigen cirkel. De totale breedte blijft gelijk.
 * Gebruik binnen een element met className="cta cta-<variant>".
 */
export function CtaInner({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="cta-fill">
        {children}
        <ArrowUpRight className="cta-arrow" size={18} strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="cta-circle" aria-hidden="true">
        <ArrowUpRight size={18} strokeWidth={2.25} />
      </span>
    </>
  );
}
