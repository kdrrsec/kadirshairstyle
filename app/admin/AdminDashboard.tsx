'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, LogOut, MessageCircle, Monitor, Phone, RefreshCw, Trash2, X } from 'lucide-react';
import logoLight from '@/public/logo-light.png';

type Appointment = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  date: string;
  time: string;
  endTime: string;
  startIso: string;
  endIso: string;
  treatmentId: number;
  treatment: string;
  duration: number;
};

const TZ = 'Europe/Amsterdam';
const STRIP_DAYS = 21;

function todayStr() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

function addDays(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days, 12)).toISOString().slice(0, 10);
}

function dateObj(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

function fmt(dateStr: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('nl-NL', { timeZone: TZ, ...opts }).format(dateObj(dateStr));
}

function longDate(dateStr: string) {
  const s = fmt(dateStr, { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function relativeLabel(dateStr: string) {
  const t = todayStr();
  if (dateStr === t) return 'Vandaag';
  if (dateStr === addDays(t, 1)) return 'Morgen';
  if (dateStr === addDays(t, -1)) return 'Gisteren';
  return null;
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function AdminDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState(todayStr());
  const [stripStart, setStripStart] = useState(todayStr());
  const [toast, setToast] = useState('');
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState<Appointment | null>(null);

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const res = await fetch('/api/admin/appointments', { cache: 'no-store' });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Afspraken konden niet worden geladen.');
      setAppointments(data.appointments || []);
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
    // Elke 60 seconden verversen, zodat nieuwe online boekingen vanzelf verschijnen.
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of appointments) map[a.date] = (map[a.date] || 0) + 1;
    return map;
  }, [appointments]);

  const dayList = appointments.filter((a) => a.date === selected);
  const strip = Array.from({ length: STRIP_DAYS }, (_, i) => addDays(stripStart, i));
  const now = Date.now();
  const upcoming = dayList.find((a) => new Date(a.endIso).getTime() > now);
  const totalUpcoming = appointments.filter((a) => new Date(a.startIso).getTime() > now).length;

  function selectDate(d: string) {
    setSelected(d);
    if (d < stripStart || d > addDays(stripStart, STRIP_DAYS - 1)) setStripStart(d);
  }

  const [sendingOverview, setSendingOverview] = useState(false);

  async function sendOverview() {
    setSendingOverview(true);
    try {
      const res = await fetch('/api/admin/dagoverzicht', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      setToast(res.ok ? 'Dagoverzicht verstuurd via WhatsApp' : data.error || 'Versturen is niet gelukt');
    } catch {
      setToast('Versturen is niet gelukt');
    } finally {
      setSendingOverview(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-top-inner">
          <div className="adm-top-brand">
            <Image src={logoLight} alt="Kadir's Hairstyle" className="adm-top-logo" priority />
            <span className="adm-top-label">Beheer</span>
          </div>
          <div className="adm-top-actions">
            <a href="/scherm" target="_blank" rel="noopener" className="adm-top-link" title="Wachtrij voor de TV in de salon">
              <Monitor size={16} strokeWidth={1.7} aria-hidden="true" />
              <span>TV-scherm</span>
            </a>
            <button
              type="button"
              className="adm-top-link"
              onClick={sendOverview}
              disabled={sendingOverview}
              title="Stuur het overzicht van vandaag via WhatsApp"
            >
              <MessageCircle size={16} strokeWidth={1.7} aria-hidden="true" />
              <span>{sendingOverview ? 'Versturen…' : 'Dagoverzicht'}</span>
            </button>
            <a href="/" className="adm-top-link">
              Website
            </a>
            <button type="button" className="adm-top-link" onClick={logout}>
              <LogOut size={16} strokeWidth={1.7} aria-hidden="true" />
              <span>Uitloggen</span>
            </button>
          </div>
        </div>
      </header>

      <main className="adm-main">
        <div className="adm-head">
          <div>
            <p className="eyebrow">{relativeLabel(selected) ?? 'Afspraken'}</p>
            <h1>{longDate(selected)}</h1>
            <p className="adm-muted">
              {loading
                ? 'Afspraken laden…'
                : dayList.length === 0
                  ? 'Geen afspraken op deze dag.'
                  : `${dayList.length} ${dayList.length === 1 ? 'afspraak' : 'afspraken'}${
                      upcoming && selected === todayStr() ? ` · eerstvolgende om ${upcoming.time}` : ''
                    }`}
            </p>
          </div>
          <div className="adm-head-tools">
            <button type="button" className="adm-chip" onClick={() => selectDate(todayStr())}>
              Vandaag
            </button>
            <label className="adm-date-jump">
              <span className="sr-only">Ga naar datum</span>
              <input type="date" value={selected} onChange={(e) => e.target.value && selectDate(e.target.value)} />
            </label>
            <button type="button" className="adm-icon-btn" onClick={load} aria-label="Vernieuwen">
              <RefreshCw size={17} strokeWidth={1.7} />
            </button>
          </div>
        </div>

        <div className="adm-strip" role="tablist" aria-label="Kies een dag">
          {strip.map((d) => {
            const count = countByDate[d] || 0;
            return (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={d === selected}
                className={`adm-day${d === selected ? ' active' : ''}${d === todayStr() ? ' today' : ''}`}
                onClick={() => setSelected(d)}
              >
                <span className="adm-day-wd">{fmt(d, { weekday: 'short' }).replace('.', '')}</span>
                <span className="adm-day-num">{fmt(d, { day: 'numeric' })}</span>
                <span className={`adm-day-count${count ? '' : ' empty'}`}>{count || '–'}</span>
              </button>
            );
          })}
        </div>

        {loadError && <p className="adm-error adm-error-block">{loadError}</p>}

        <section className="adm-list" aria-live="polite">
          {!loading && dayList.length === 0 && !loadError && (
            <div className="adm-empty">
              <CalendarClock size={28} strokeWidth={1.3} aria-hidden="true" />
              <p>Geen afspraken op {longDate(selected).toLowerCase()}.</p>
            </div>
          )}

          {dayList.map((a) => {
            const past = new Date(a.endIso).getTime() < now;
            return (
              <article key={a.id} className={`adm-appt${past ? ' past' : ''}`}>
                <div className="adm-appt-time">
                  <strong>{a.time}</strong>
                  <span>tot {a.endTime}</span>
                </div>
                <div className="adm-appt-body">
                  <h2>{a.name}</h2>
                  <p>
                    {a.treatment} · {a.duration} min
                    {past && <span className="adm-tag">Geweest</span>}
                  </p>
                  <a href={telHref(a.phone)} className="adm-phone">
                    <Phone size={14} strokeWidth={1.8} aria-hidden="true" />
                    {a.phone}
                  </a>
                </div>
                <div className="adm-appt-actions">
                  <button type="button" className="adm-action" onClick={() => setRescheduling(a)}>
                    <CalendarClock size={16} strokeWidth={1.7} aria-hidden="true" />
                    Verzetten
                  </button>
                  <button type="button" className="adm-action danger" onClick={() => setDeleting(a)}>
                    <Trash2 size={16} strokeWidth={1.7} aria-hidden="true" />
                    Verwijderen
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <p className="adm-foot">
          {totalUpcoming} komende {totalUpcoming === 1 ? 'afspraak' : 'afspraken'} in totaal
        </p>
      </main>

      {rescheduling && (
        <RescheduleDialog
          appointment={rescheduling}
          onClose={() => setRescheduling(null)}
          onDone={(date, time) => {
            setRescheduling(null);
            setToast(`Afspraak verzet naar ${longDate(date).toLowerCase()} om ${time}`);
            selectDate(date);
            load();
          }}
        />
      )}

      {deleting && (
        <Dialog title="Afspraak verwijderen?" onClose={() => setDeleting(null)}>
          <DeleteBody
            appointment={deleting}
            onCancel={() => setDeleting(null)}
            onDone={() => {
              setDeleting(null);
              setToast('Afspraak verwijderd');
              load();
            }}
          />
        </Dialog>
      )}

      {toast && (
        <div className="adm-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="adm-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-dialog" role="dialog" aria-modal="true" aria-label={title}>
        <div className="adm-dialog-head">
          <h2>{title}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Sluiten">
            <X size={18} strokeWidth={1.7} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Summary({ a }: { a: Appointment }) {
  return (
    <div className="adm-summary">
      <strong>{a.name}</strong>
      <span>
        {a.treatment} · {longDate(a.date)} om {a.time}
      </span>
    </div>
  );
}

function DeleteBody({
  appointment,
  onCancel,
  onDone,
}: {
  appointment: Appointment;
  onCancel: () => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirmDelete() {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/admin/appointments?id=${appointment.id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Verwijderen is niet gelukt.');
      return;
    }
    onDone();
  }

  return (
    <>
      <Summary a={appointment} />
      <p className="adm-muted">
        De afspraak wordt definitief verwijderd en de tijd komt weer vrij voor online boekingen. Laat de klant het even
        weten.
      </p>
      {error && <p className="adm-error">{error}</p>}
      <div className="adm-dialog-foot">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Terug
        </button>
        <button type="button" className="btn adm-btn-danger" onClick={confirmDelete} disabled={busy}>
          {busy ? 'Bezig…' : 'Verwijderen'}
        </button>
      </div>
    </>
  );
}

function RescheduleDialog({
  appointment,
  onClose,
  onDone,
}: {
  appointment: Appointment;
  onClose: () => void;
  onDone: (date: string, time: string) => void;
}) {
  const [date, setDate] = useState(appointment.date);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [time, setTime] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setTime('');
    fetch(`/api/admin/availability?id=${appointment.id}&date=${date}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, appointment.id]);

  async function save() {
    if (!date || !time) {
      setError('Kies een datum en tijd.');
      return;
    }
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: appointment.id, date, time }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Verzetten is niet gelukt.');
      return;
    }
    onDone(date, time);
  }

  return (
    <Dialog title="Afspraak verzetten" onClose={onClose}>
      <Summary a={appointment} />

      <label className="adm-field">
        <span>Nieuwe datum</span>
        <input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} />
      </label>

      <div className="adm-field">
        <span>Vrije tijden</span>
        {loadingSlots && <p className="adm-muted">Tijden laden…</p>}
        {!loadingSlots && slots.length === 0 && (
          <p className="adm-muted">Geen vrije tijden binnen de openingstijden. Kies hieronder zelf een tijd.</p>
        )}
        {!loadingSlots && slots.length > 0 && (
          <div className="adm-slots">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                className={`adm-slot${time === s ? ' active' : ''}`}
                onClick={() => setTime(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <label className="adm-field adm-field-inline">
        <span>Of zelf een tijd</span>
        <input type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} />
      </label>

      {error && <p className="adm-error">{error}</p>}

      <div className="adm-dialog-foot">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Annuleren
        </button>
        <button type="button" className="btn btn-primary" onClick={save} disabled={busy || !time}>
          {busy ? 'Opslaan…' : time ? `Verzetten naar ${time}` : 'Kies een tijd'}
        </button>
      </div>
    </Dialog>
  );
}
