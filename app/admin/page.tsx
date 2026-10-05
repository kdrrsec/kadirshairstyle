'use client';

import { useEffect, useState } from 'react';
import { Brand } from '@/components/Brand';

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

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  function loadAppointments() {
    setLoading(true);
    fetch('/api/admin/appointments')
      .then(async (r) => {
        if (r.status === 401) {
          setAuthed(false);
          return null;
        }
        setAuthed(true);
        return r.json();
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

  if (authed === null) {
    return (
      <main className="booking-page">
        <p className="muted">Laden…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="booking-page">
        <Brand className="booking-brand" href="/" />
        <div className="booking-card admin-login">
          <h1>Beheer inloggen</h1>
          <form onSubmit={handleLogin}>
            <label className="field">
              <span>Wachtwoord</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </label>
            {loginError && <p className="form-error">{loginError}</p>}
            <button type="submit" className="btn btn-primary">
              Inloggen
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <Brand className="booking-brand" href="/" />
      <div className="booking-card admin-dashboard">
        <h1>Afspraken</h1>
        {loading && <p className="muted">Laden…</p>}
        {!loading && appointments.length === 0 && <p className="muted">Geen afspraken gevonden.</p>}
        {!loading && appointments.length > 0 && (
          <div className="appointment-list">
            {appointments.map((a) => (
              <div key={a.id} className={`appointment-row${a.status === 'cancelled' ? ' cancelled' : ''}`}>
                <div>
                  <strong>{formatDateTime(a.start_time)}</strong>
                  <div className="muted">{a.treatment_name}</div>
                  <div className="muted">
                    {a.customer_name} · {a.customer_phone}
                    {a.customer_email ? ` · ${a.customer_email}` : ''}
                  </div>
                </div>
                {a.status !== 'cancelled' ? (
                  <button type="button" className="btn btn-ghost" onClick={() => handleCancel(a.id)}>
                    Annuleren
                  </button>
                ) : (
                  <span className="status-badge">Geannuleerd</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
