'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import logoLight from '@/public/logo-light.png';

type Item = { id: number; name: string; time: string; startIso: string; endIso: string };

const TZ = 'Europe/Amsterdam';
const MAX_UPCOMING = 6;

function clock(d: Date) {
  return new Intl.DateTimeFormat('nl-NL', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
}

function longDate(d: Date) {
  const s = new Intl.DateTimeFormat('nl-NL', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * TV-scherm voor in de salon: toont alleen tijd en voornaam van de afspraken van vandaag.
 * Openen via /scherm?code=<SCREEN_TOKEN> (of ingelogd als beheerder).
 */
export default function SchermPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied' | 'error'>('loading');
  const [now, setNow] = useState(() => new Date());
  const [qr, setQr] = useState('');
  const [fullscreen, setFullscreen] = useState(false);

  const load = useCallback(async () => {
    const code = new URLSearchParams(window.location.search).get('code') || '';
    try {
      const res = await fetch(`/api/scherm?code=${encodeURIComponent(code)}`, { cache: 'no-store' });
      if (res.status === 401) {
        setStatus('denied');
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.appointments || []);
      setStatus('ok');
    } catch {
      // Bij een tijdelijke storing de laatst bekende lijst laten staan.
      setStatus((s) => (s === 'ok' ? 'ok' : 'error'));
    }
  }, []);

  useEffect(() => {
    load();
    const data = setInterval(load, 30000);
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(data);
      clearInterval(tick);
    };
  }, [load]);

  // QR-code naar de boekpagina
  useEffect(() => {
    QRCode.toString(`${window.location.origin}/afspraak`, {
      type: 'svg',
      margin: 0,
      color: { dark: '#1b1c1e', light: '#f5f2ec' },
    })
      .then(setQr)
      .catch(() => setQr(''));
  }, []);

  // Scherm wakker houden waar de browser dat ondersteunt
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
    const request = () => nav.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {});
    request();
    const onVisible = () => document.visibilityState === 'visible' && request();
    document.addEventListener('visibilitychange', onVisible);
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      document.removeEventListener('fullscreenchange', onFs);
      lock?.release().catch(() => {});
    };
  }, []);

  function goFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
  }

  const t = now.getTime();
  const current = items.find((a) => new Date(a.startIso).getTime() <= t && new Date(a.endIso).getTime() > t);
  const upcoming = items.filter((a) => new Date(a.startIso).getTime() > t);
  // Zonder lopende afspraak staat de eerstvolgende groot in beeld; de lijst toont de rest.
  const rest = current ? upcoming : upcoming.slice(1);
  const shown = rest.slice(0, MAX_UPCOMING);
  const more = rest.length - shown.length;

  return (
    <main className="scr" onClick={goFullscreen}>
      <header className="scr-head">
        <Image src={logoLight} alt="Kadir's Hairstyle" className="scr-logo" priority />
        <div className="scr-clock">
          <strong>{clock(now)}</strong>
          <span>{longDate(now)}</span>
        </div>
      </header>

      {status === 'denied' ? (
        <section className="scr-message">
          <h1>Geen toegang</h1>
          <p>Open dit scherm via de link met de juiste code, of log eerst in op het beheer.</p>
        </section>
      ) : (
        <section className="scr-body">
          <div className="scr-now">
            <p className="scr-label">{current ? 'Nu aan de beurt' : upcoming[0] ? 'Straks aan de beurt' : 'Welkom'}</p>
            {current ? (
              <>
                <h1>{current.name}</h1>
                <p className="scr-now-time">{current.time}</p>
              </>
            ) : upcoming[0] ? (
              <>
                <h1>{upcoming[0].name}</h1>
                <p className="scr-now-time">om {upcoming[0].time}</p>
              </>
            ) : (
              <>
                <h1 className="scr-welcome">Welkom bij Kadir&rsquo;s</h1>
                <p className="scr-now-time">
                  {status === 'loading' ? 'Afspraken laden…' : 'Geen afspraken meer voor vandaag'}
                </p>
              </>
            )}
          </div>

          <div className="scr-next">
            <p className="scr-label">Hierna vandaag</p>
            {shown.length === 0 ? (
              <p className="scr-empty">Geen afspraken meer</p>
            ) : (
              <ol>
                {shown.map((a) => (
                  <li key={a.id}>
                    <span className="scr-time">{a.time}</span>
                    <span className="scr-name">{a.name}</span>
                  </li>
                ))}
              </ol>
            )}
            {more > 0 && <p className="scr-more">+ {more} later vandaag</p>}
          </div>
        </section>
      )}

      <footer className="scr-foot">
        {qr && <span className="scr-qr" dangerouslySetInnerHTML={{ __html: qr }} aria-hidden="true" />}
        <div>
          <strong>Scan en boek je volgende afspraak</strong>
          <span>Of reserveer online via de website</span>
        </div>
        {!fullscreen && <span className="scr-hint">Klik voor volledig scherm</span>}
      </footer>
    </main>
  );
}
