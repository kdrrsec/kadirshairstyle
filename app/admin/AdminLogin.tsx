'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import logoDark from '@/public/logo.png';
import logoLight from '@/public/logo-light.png';
import { heroImage } from '@/content/images';

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Inloggen is niet gelukt.');
        return;
      }
      router.refresh();
    } catch {
      setError('Geen verbinding. Probeer het opnieuw.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="adm-login">
      <div className="adm-login-visual">
        <Image src={heroImage.src} alt="" fill priority sizes="(max-width: 860px) 100vw, 55vw" quality={70} />
        <div className="adm-login-visual-inner">
          <Image src={logoLight} alt="Kadir's Hairstyle" className="adm-login-logo" priority />
          <p>Afspraken beheren</p>
        </div>
      </div>

      <div className="adm-login-panel">
        <form onSubmit={handleSubmit} className="adm-login-form">
          <Image src={logoDark} alt="Kadir's Hairstyle" className="adm-login-logo-mobile" />
          <p className="eyebrow">Beheer</p>
          <h1>Welkom terug</h1>
          <p className="adm-muted">Log in om je afspraken te bekijken, te verzetten of te verwijderen.</p>

          <label className="adm-field">
            <span>Wachtwoord</span>
            <span className="adm-input-wrap">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                required
              />
              <button
                type="button"
                className="adm-input-toggle"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
              >
                {show ? <EyeOff size={18} strokeWidth={1.6} /> : <Eye size={18} strokeWidth={1.6} />}
              </button>
            </span>
          </label>

          {error && <p className="adm-error">{error}</p>}

          <button type="submit" className="btn btn-primary adm-login-submit" disabled={busy || !password}>
            {busy ? 'Bezig…' : 'Inloggen'}
          </button>

          <Link href="/" className="adm-back">
            ← Terug naar de website
          </Link>
        </form>
      </div>
    </main>
  );
}
