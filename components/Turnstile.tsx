'use client';

import { useEffect, useRef } from 'react';

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.turnstile) return resolve();
    let s = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (!s) {
      s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      document.head.appendChild(s);
    }
    s.addEventListener('load', () => resolve());
    s.addEventListener('error', () => reject(new Error('Turnstile laden mislukt')));
  });
}

type Props = {
  siteKey: string;
  onToken: (token: string) => void;
  /** Verhoog dit getal om het vinkje opnieuw te laten zetten (een token is maar één keer bruikbaar). */
  resetKey?: number;
};

/** Cloudflare Turnstile: het "ik ben een mens"-vinkje. */
export function Turnstile({ siteKey, onToken, resetKey = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile || widgetId.current) return;
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          language: 'nl',
          theme: 'light',
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(''),
          'error-callback': () => onTokenRef.current(''),
        });
      })
      .catch(() => onTokenRef.current(''));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetKey && widgetId.current && window.turnstile) {
      onTokenRef.current('');
      window.turnstile.reset(widgetId.current);
    }
  }, [resetKey]);

  return <div ref={ref} className="turnstile" />;
}
