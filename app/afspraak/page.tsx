'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Brand } from '@/components/Brand';
import { site, type DayKey } from '@/content/site';

type Treatment = {
  id: number;
  slug: string;
  name: string;
  duration_minutes: number;
  price_from: number | null;
};

type StepKey = 'service' | 'time' | 'details' | 'done';

const TZ = 'Europe/Amsterdam';
const WEEKDAY_KEYS: DayKey[] = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

function formatEuro(value: number) {
  return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatPrice(value: number | null) {
  return value === null ? 'op aanvraag' : `€${formatEuro(value)}`;
}

function toDateStr(d: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
}

function buildDays(count: number) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    const dateStr = toDateStr(d);
    const [y, m, day] = dateStr.split('-').map(Number);
    const weekday = new Date(Date.UTC(y, m - 1, day, 12)).getUTCDay();
    days.push({
      dateStr,
      dayNum: new Intl.DateTimeFormat('nl-NL', { timeZone: TZ, day: 'numeric' }).format(d),
      weekday: new Intl.DateTimeFormat('nl-NL', { timeZone: TZ, weekday: 'short' }).format(d).toUpperCase(),
      closed: !site.hours[WEEKDAY_KEYS[weekday]],
    });
  }
  return days;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

function timeIsEvening(timeStr: string) {
  return Number(timeStr.split(':')[0]) >= 17;
}

function formatDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat('nl-NL', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(dt);
}

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'service', label: 'Dienst' },
  { key: 'time', label: 'Tijd' },
  { key: 'details', label: 'Gegevens' },
  { key: 'done', label: 'Klaar' },
];

export default function AfspraakPage() {
  const [step, setStep] = useState<StepKey>('service');
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loadError, setLoadError] = useState('');
  const [treatmentId, setTreatmentId] = useState<number | null>(null);

  const allDays = useMemo(() => buildDays(60), []);
  const [visibleDayCount, setVisibleDayCount] = useState(14);
  const days = allDays.slice(0, visibleDayCount);
  const [selectedDate, setSelectedDate] = useState(allDays[0].dateStr);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [time, setTime] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<{ date: string; time: string; treatment?: Treatment } | null>(null);

  useEffect(() => {
    fetch('/api/treatments')
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || 'Er ging iets mis bij het laden.');
        const list: Treatment[] = data.treatments || [];
        setTreatments(list);
        // Dienst voorselecteren via ?behandeling=slug
        const slug = new URLSearchParams(window.location.search).get('behandeling');
        const pre = slug ? list.find((t) => t.slug === slug) : null;
        if (pre) setTreatmentId(pre.id);
      })
      .catch((e: Error) => setLoadError(e.message));
  }, []);

  useEffect(() => {
    if (step !== 'time' || !treatmentId) return;
    setLoadingSlots(true);
    setTime(null);
    fetch(`/api/availability?treatmentId=${treatmentId}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [step, treatmentId, selectedDate]);

  const selectedTreatment = treatments.find((t) => t.id === treatmentId);
  const maxStepIndex = confirmed ? 3 : time ? 2 : treatmentId ? 1 : 0;

  function goTo(stepKey: StepKey) {
    const idx = STEPS.findIndex((s) => s.key === stepKey);
    if (idx <= maxStepIndex && stepKey !== 'done' && !confirmed) setStep(stepKey);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !phone.trim()) {
      setError('Vul je naam en telefoonnummer in.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treatmentId, date: selectedDate, time, name, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Er ging iets mis. Probeer het opnieuw.');
        if (res.status === 409) {
          // Effect hierboven laadt de tijden opnieuw zodra we terug naar 'time' gaan.
          setTime(null);
          setStep('time');
        }
        return;
      }
      setConfirmed({ date: selectedDate, time: time!, treatment: selectedTreatment });
      setStep('done');
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="booking-page">
      <Brand className="booking-brand" href="/" />

      <div className="booking-shell">
        <nav className="stepper" aria-label="Stappen">
          {STEPS.map((s, i) => (
            <span key={s.key} className="stepper-item">
              {i > 0 && <span className="stepper-sep">›</span>}
              <button
                type="button"
                className={`stepper-btn${step === s.key ? ' active' : ''}${i <= maxStepIndex ? ' enabled' : ''}`}
                onClick={() => goTo(s.key)}
                disabled={i > maxStepIndex || !!confirmed}
              >
                {s.label}
              </button>
            </span>
          ))}
        </nav>

        <div className="booking-grid">
          <div className="booking-main">
            {step === 'service' && (
              <div className="booking-panel">
                <h1>Kies een dienst</h1>
                {loadError && (
                  <p className="form-error">
                    {loadError}
                    {site.phone && (
                      <>
                        {' '}
                        Bel ons op <a href={`tel:${site.phone.href}`}>{site.phone.display}</a>.
                      </>
                    )}
                  </p>
                )}
                <div className="service-grid">
                  {treatments.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`service-card${treatmentId === t.id ? ' selected' : ''}`}
                      onClick={() => setTreatmentId(t.id)}
                      aria-pressed={treatmentId === t.id}
                    >
                      {treatmentId === t.id && <span className="service-check">✓</span>}
                      <span className="service-name">{t.name}</span>
                      <span className="service-duration">{t.duration_minutes} min</span>
                      <span className="service-price">{formatPrice(t.price_from)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'time' && (
              <div className="booking-panel">
                <div className="panel-header-row">
                  <h1>Kies dag en tijd</h1>
                  <button type="button" className="today-btn" onClick={() => setSelectedDate(allDays[0].dateStr)}>
                    Vandaag
                  </button>
                </div>
                <div className="day-picker">
                  {days.map((d) => (
                    <div key={d.dateStr} className="day-col">
                      <button
                        type="button"
                        className={`day-circle${selectedDate === d.dateStr ? ' selected' : ''}${d.closed ? ' closed' : ''}`}
                        onClick={() => setSelectedDate(d.dateStr)}
                        aria-label={`${formatDateLabel(d.dateStr)}${d.closed ? ' (gesloten)' : ''}`}
                      >
                        {d.dayNum}
                      </button>
                      <span className="day-col-label">{d.weekday}</span>
                    </div>
                  ))}
                  {visibleDayCount < allDays.length && (
                    <div className="day-col">
                      <button
                        type="button"
                        className="day-circle day-more"
                        onClick={() => setVisibleDayCount((c) => Math.min(c + 14, allDays.length))}
                      >
                        +
                      </button>
                      <span className="day-col-label">Meer</span>
                    </div>
                  )}
                </div>

                {error && <p className="form-error">{error}</p>}
                {loadingSlots && <p className="muted">Beschikbare tijden laden…</p>}
                {!loadingSlots && slots.length === 0 && (
                  <p className="muted">Geen beschikbare tijden op deze dag. Kies een andere datum.</p>
                )}
                {!loadingSlots && slots.length > 0 && (
                  <div className="slot-grid">
                    {slots.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`slot-btn${time === s ? ' selected' : ''}`}
                        onClick={() => {
                          setError('');
                          setTime(s);
                          setStep('details');
                        }}
                      >
                        <span className="slot-icon">{timeIsEvening(s) ? <MoonIcon /> : <SunIcon />}</span>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 'details' && (
              <div className="booking-panel">
                <h1>Laatste stap: jouw gegevens</h1>
                <form onSubmit={handleSubmit} className="details-form">
                  <label className="field">
                    <span>Naam *</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Voor- en achternaam"
                      autoComplete="name"
                      maxLength={120}
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Telefoonnummer *</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      type="tel"
                      autoComplete="tel"
                      maxLength={40}
                      required
                    />
                  </label>
                  {error && <p className="form-error">{error}</p>}
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Bezig…' : 'Afspraak bevestigen'}
                  </button>
                  <p className="details-note">We nemen alleen contact op als er iets wijzigt aan je afspraak.</p>
                </form>
              </div>
            )}

            {step === 'done' && confirmed && (
              <div className="booking-panel booking-confirm">
                <div className="confirm-icon">✓</div>
                <h1>Afspraak bevestigd</h1>
                <p>
                  Je afspraak voor <strong>{confirmed.treatment?.name}</strong> op{' '}
                  <strong>{formatDateLabel(confirmed.date)}</strong> om <strong>{confirmed.time}</strong> uur is
                  ingepland.
                </p>
                <p className="confirm-note">
                  Moet je verzetten of annuleren?{' '}
                  {site.phone ? (
                    <>
                      Bel ons gerust op <a href={`tel:${site.phone.href}`}>{site.phone.display}</a>.
                    </>
                  ) : (
                    <>Neem gerust contact op met de salon.</>
                  )}
                </p>
                <Link href="/" className="btn btn-primary">
                  Terug naar de website
                </Link>
              </div>
            )}
          </div>

          <aside className="order-summary">
            <h2>Jouw afspraak</h2>
            <p className="order-shop">
              {site.name} {site.city}
            </p>

            {!selectedTreatment && <p className="muted">Nog geen dienst gekozen.</p>}

            {selectedTreatment && (
              <div className="order-line">
                <div>
                  <div className="order-line-name">{selectedTreatment.name}</div>
                  {time && (
                    <div className="order-line-meta">
                      {formatDateLabel(selectedDate)} · {time}
                    </div>
                  )}
                </div>
                <div className="order-line-price">{formatPrice(selectedTreatment.price_from)}</div>
              </div>
            )}

            {selectedTreatment && (
              <div className="order-subtotal">
                <span>Subtotaal</span>
                <span>{formatPrice(selectedTreatment.price_from)}</span>
              </div>
            )}

            {step === 'service' && treatmentId && (
              <button type="button" className="btn btn-primary order-cta" onClick={() => setStep('time')}>
                Kies een tijd
              </button>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
