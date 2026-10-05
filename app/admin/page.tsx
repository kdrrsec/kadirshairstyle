'use client';

import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';

type Appointment = {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  start_time: string;
  end_time: string;
  status: string;
  treatment_name: string;
};

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

const buttonCls =
  'inline-flex min-h-12 items-center justify-center rounded-[2px] bg-ink px-6 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-mocha';

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  function loadAppointments() {
    setLoading(true);
    setLoadError('');
    fetch('/api/admin/appointments')
      .then(async (r) => {
        if (r.status === 401) {
          setAuthed(false);
          return null;
        }
        setAuthed(true);
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setLoadError(data.error || 'Afspraken konden niet worden geladen.');
          return null;
        }
        return data;
      })
      .then((data) => {
        if (data) setAppointments(data.appointments || []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError('Onjuist wachtwoord.');
      return;
    }
    setPassword('');
    loadAppointments();
  }

  async function handleCancel(id: number) {
    if (!confirm('Deze afspraak annuleren?')) return;
    await fetch(`/api/admin/appointments?id=${id}`, { method: 'DELETE' });
    loadAppointments();
  }

  return (
    <div className="min-h-[100svh] bg-ivory">
      <header className="border-b border-ink/10">
        <div className="container-edge flex h-20 items-center justify-between">
          <Logo />
          <span className="caps text-stone">Beheer</span>
        </div>
      </header>

      <main className="container-edge py-14">
        <div className="max-w-3xl">
        {authed === null && <p className="text-stone">Laden…</p>}

        {authed === false && (
          <section className="max-w-sm">
            <h1 className="text-[2.5rem] leading-none">Beheer inloggen</h1>
            <form onSubmit={handleLogin} className="mt-10 space-y-6">
              <label className="block">
                <span className="caps text-mocha">Wachtwoord</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  autoComplete="current-password"
                  className="mt-2 block w-full rounded-none border-0 border-b border-ink/25 bg-transparent px-0 py-3 text-lg focus:border-ink focus:outline-none"
                />
              </label>
              {loginError && <p className="text-sm text-mocha">{loginError}</p>}
              <button type="submit" className={buttonCls}>
                Inloggen
              </button>
            </form>
          </section>
        )}

        {authed && (
          <section>
            <h1 className="text-[2.5rem] leading-none">Afspraken</h1>
            {loading && <p className="mt-8 text-stone">Laden…</p>}
            {loadError && <p className="mt-8 text-mocha">{loadError}</p>}
            {!loading && !loadError && appointments.length === 0 && (
              <p className="mt-8 text-stone">Geen afspraken gevonden.</p>
            )}
            {!loading && appointments.length > 0 && (
              <ul className="mt-10 border-t border-ink/12">
                {appointments.map((a) => (
                  <li
                    key={a.id}
                    className={`flex flex-col gap-4 border-b border-ink/12 py-5 sm:flex-row sm:items-center sm:justify-between ${
                      a.status === 'cancelled' ? 'opacity-50' : ''
                    }`}
                  >
                    <div>
                      <p className="font-display text-xl first-letter:uppercase">{formatDateTime(a.start_time)}</p>
                      <p className="mt-1 text-sm text-ink-soft">{a.treatment_name}</p>
                      <p className="mt-1 text-sm text-stone">
                        {a.customer_name} ·{' '}
                        <a href={`tel:${a.customer_phone}`} className="underline underline-offset-2">
                          {a.customer_phone}
                        </a>
                        {a.customer_email ? ` · ${a.customer_email}` : ''}
                      </p>
                    </div>
                    {a.status !== 'cancelled' ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(a.id)}
                        className="self-start border-b border-ink/30 pb-0.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-ink hover:text-ink sm:self-auto"
                      >
                        Annuleren
                      </button>
                    ) : (
                      <span className="caps text-stone">Geannuleerd</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        </div>
      </main>
    </div>
  );
}
