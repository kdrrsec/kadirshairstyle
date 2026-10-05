'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BOOKING_HREF, navItems, site } from '@/content/site';
import { Logo } from './ui/Logo';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-700 ease-[var(--ease-editorial)] ${
        scrolled && !open
          ? 'border-b border-ink/8 bg-ivory/88 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div
        className={`container-edge flex items-center justify-between transition-[height] duration-700 ease-[var(--ease-editorial)] ${
          scrolled ? 'h-[4.5rem]' : 'h-20 md:h-24'
        }`}
      >
        <Logo onClick={close} tone={open ? 'light' : 'dark'} className="relative z-10 transition-colors duration-500" />

        <nav aria-label="Hoofdnavigatie" className="hidden items-center gap-9 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-2 text-[0.8125rem] tracking-[0.04em] text-ink-soft transition-colors duration-300 hover:text-ink"
            >
              {item.label}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:scale-x-100"
              />
            </Link>
          ))}
        </nav>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            href={BOOKING_HREF}
            className="group hidden h-11 items-center gap-3 rounded-[2px] border border-ink bg-ink px-6 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ivory transition-colors duration-500 ease-[var(--ease-editorial)] hover:bg-transparent hover:text-ink sm:inline-flex"
          >
            Reserveer
            <span aria-hidden="true" className="transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-1">
              →
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobiel-menu"
            aria-label={open ? 'Menu sluiten' : 'Menu openen'}
            className={`flex h-11 w-11 flex-col items-center justify-center gap-[7px] lg:hidden ${open ? 'text-ivory' : 'text-ink'}`}
          >
            <span
              className={`block h-px w-6 bg-current transition-transform duration-500 ease-[var(--ease-editorial)] ${
                open ? 'translate-y-[4px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-px w-6 bg-current transition-transform duration-500 ease-[var(--ease-editorial)] ${
                open ? '-translate-y-[4px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobiel-menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 flex h-[100dvh] flex-col bg-night px-5 pb-8 pt-28 text-ivory md:px-10 lg:hidden"
          >
            <nav aria-label="Mobiele navigatie" className="flex flex-col">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-ivory/10"
                >
                  <Link href={item.href} onClick={close} className="flex items-baseline gap-5 py-4">
                    <span className="caps w-6 text-champagne/70">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-display text-[2.4rem] leading-none">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-auto flex flex-col gap-6"
            >
              <Link
                href={BOOKING_HREF}
                onClick={close}
                className="flex min-h-16 items-center justify-between rounded-[2px] bg-ivory px-6 text-[0.78rem] font-medium uppercase tracking-[0.2em] text-ink"
              >
                Reserveer jouw moment <span aria-hidden="true">→</span>
              </Link>
              <p className="caps text-ivory/50">
                {site.name} · {site.city}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
