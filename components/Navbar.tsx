'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BOOKING_HREF, navItems } from '@/content/site';
import { Brand } from './Brand';
import { CtaInner } from '@/components/CtaInner';

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <header className="navbar" id="navbar">
        <div className="nav-inner">
          <Brand onClick={close} variant="compact" priority />
          <nav className="nav-links" aria-label="Hoofdnavigatie">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="nav-right">
            <Link href={BOOKING_HREF} className="cta cta-dark cta-sm nav-cta">
              <CtaInner>Maak afspraak</CtaInner>
            </Link>
            <button
              type="button"
              className={`burger${open ? ' open' : ''}`}
              aria-label={open ? 'Menu sluiten' : 'Menu openen'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <nav className={`nav-mobile${open ? ' open' : ''}`} aria-label="Mobiele navigatie">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={close}>
              {item.label}
            </a>
          ))}
          <Link href={BOOKING_HREF} className="cta cta-dark cta-block nav-mobile-cta" onClick={close}>
            <CtaInner>Maak afspraak</CtaInner>
          </Link>
        </nav>
      </header>

      <div className={`nav-backdrop${open ? ' open' : ''}`} onClick={close} aria-hidden="true"></div>
    </>
  );
}
