'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Moon, Sun } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { site, type DayKey } from '@/content/site';

type Treatment = {
  id: number;
  slug: string;
  name: string;
  duration_minutes: number;
  price_from: number | null;
};

type StepKey = 'service' | 'time' | 'details' | 'done';

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'service', label: 'Dienst' },
  { key: 'time', label: 'Tijd' },
  { key: 'details', label: 'Gegevens' },
  { key: 'done', label: 'Klaar' },
];

const TZ = 'Europe/Amsterdam';
const WEEKDAY_KEYS: DayKey[] = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

function formatEuro(value: number) {
  return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
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
      weekday: new Intl.DateTimeFormat('nl-NL', { timeZone: TZ, weekday: 'short' }).format(d).replace('.', ''),
      month: new Intl.DateTimeFormat('nl-NL', { timeZone: TZ, month: 'short' }).format(d).replace('.', ''),
      closed: !site.hours[WEEKDAY_KEYS[weekday]],
    });
  }
  return days;
}

function timeIsEvening(timeStr: string) {
  return Number(timeStr.split(':')[0]) >= 17;
}

function formatDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat('nl-NL', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(dt);
}

const panel = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

function PrimaryButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`group inline-flex min-h-14 items-center justify-between gap-8 rounded-[2px] bg-ink px-7 text-[0.75rem] font-medium uppercase tracking-[0.2em] text-ivory transition-colors duration-500 hover:bg-mocha disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">
        →
      </span>
    </button>
  );
}

export default function AfspraakPage() {
  const [step, setStep] = useState<StepKey>('service');
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loadError, setLoadError] = useState('');
  const [loadingTreatments, setLoadingTreatments] = useState(true);
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
        // Behandeling voorselecteren vanuit de homepage (?behandeling=slug)
        const slug = new URLSearchParams(window.location.search).get('behandeling');
        const pre = slug ? list.find((t) => t.slug === slug) : null;
        if (pre) {
          setTreatmentId(pre.id);
          setStep('time');
        }
      })
      .catch((e: Error) => setLoadError(e.message))
      .finally(() => setLoadingTreatments(false));
  }, []);

  function loadSlots() {
    if (!treatmentId) return;
    setLoadingSlots(true);
    fetch(`/api/availability?treatmentId=${treatmentId}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }

  useEffect(() => {
    if (step !== 'time' || !treatmentId) return;
    setTime(null);
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, treatmentId, selectedDate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

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

  const contactFallback = site.phone ? (
    <>
      Bel ons gerust op{' '}
      <a href={`tel:${site.phone.href}`} className="underline underline-offset-4">
        {site.phone.display}
      </a>
      .
    </>
  ) : (
    <>Neem gerust contact op met de salon.</>
  );

  return (
    <div className="min-h-[100svh] bg-ivory">
      <header className="border-b border-ink/10">
        <div className="container-edge flex h-20 items-center justify-between md:h-24">
          <Logo />
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
          >
            <span aria-hidden="true" className="transition-transform duration-500 group-hover:-translate-x-1">
              ←
            </span>
            <span className="hidden sm:inline">Terug naar de website</span>
            <span className="sm:hidden">Terug</span>
          </Link>
        </div>
      </header>

      <main className="container-edge pb-24 pt-10 md:pt-16">
        <p className="caps text-mocha">Reserveer jouw moment</p>

        <nav aria-label="Stappen" className="mt-6 overflow-x-auto">
          <ol className="flex min-w-max items-center gap-3 md:gap-5">
            {STEPS.map((s, i) => {
              const enabled = i <= maxStepIndex;
              const active = step === s.key;
              return (
                <li key={s.key} className="flex items-center gap-3 md:gap-5">
                  {i > 0 && <span aria-hidden="true" className="h-px w-6 bg-ink/20 md:w-10" />}
                  <button
                    type="button"
                    onClick={() => goTo(s.key)}
                    disabled={!enabled || !!confirmed}
                    aria-current={active ? 'step' : undefined}
                    className={`flex items-baseline gap-2 border-b py-1.5 text-[0.75rem] font-medium uppercase tracking-[0.16em] transition-colors ${
                      active
                        ? 'border-ink text-ink'
                        : enabled
                          ? 'border-transparent text-ink-soft hover:text-ink'
                          : 'border-transparent text-stone/50'
                    }`}
                  >
                    <span className="font-display text-base normal-case tracking-normal">{String(i + 1).padStart(2, '0')}</span>
                    {s.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mt-10 grid grid-cols-1 gap-10 md:mt-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              {step === 'service' && (
                <motion.section key="service" {...panel} aria-labelledby="stap-titel">
                  <h1 id="stap-titel" className="text-[2.5rem] leading-none md:text-[3.5rem]">
                    Kies een <span className="italic">dienst</span>
                  </h1>

                  {loadingTreatments && <p className="mt-8 text-stone">Behandelingen laden…</p>}
                  {loadError && (
                    <div className="mt-8 border-l-2 border-mocha bg-cream px-6 py-5 text-ink-soft">
                      <p>{loadError}</p>
                      <p className="mt-2 text-sm">{contactFallback}</p>
                    </div>
                  )}

                  <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {treatments.map((t) => {
                      const selected = treatmentId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setTreatmentId(t.id)}
                          className={`relative flex min-h-32 flex-col items-start justify-between border p-6 text-left transition-colors duration-300 ${
                            selected ? 'border-ink bg-cream' : 'border-ink/15 hover:border-ink/50'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`absolute right-5 top-5 flex h-6 w-6 items-center justify-center border transition-colors ${
                              selected ? 'border-ink bg-ink text-ivory' : 'border-ink/20 text-transparent'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" strokeWidth={2} />
                          </span>
                          <span className="pr-10 font-display text-[1.75rem] leading-tight">{t.name}</span>
                          <span className="mt-6 flex w-full items-baseline justify-between gap-4 text-sm text-stone">
                            <span>± {t.duration_minutes} min</span>
                            <span className="text-ink">
                              {t.price_from !== null ? `vanaf €${formatEuro(t.price_from)}` : 'Prijs in overleg'}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {treatmentId && (
                    <div className="mt-8 lg:hidden">
                      <PrimaryButton type="button" onClick={() => setStep('time')} className="w-full sm:w-auto">
                        Kies een tijd
                      </PrimaryButton>
                    </div>
                  )}
                </motion.section>
              )}

              {step === 'time' && (
                <motion.section key="time" {...panel} aria-labelledby="stap-titel">
                  <div className="flex items-end justify-between gap-6">
                    <h1 id="stap-titel" className="text-[2.5rem] leading-none md:text-[3.5rem]">
                      Kies dag en <span className="italic">tijd</span>
                    </h1>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(allDays[0].dateStr)}
                      className="shrink-0 border-b border-ink/30 pb-0.5 text-[0.75rem] font-medium uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                    >
                      Vandaag
                    </button>
                  </div>

                  <p className="mt-8 font-display text-xl italic text-mocha first-letter:uppercase">{formatDateLabel(selectedDate)}</p>

                  <div className="-mx-5 mt-5 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
                    <div className="flex min-w-max gap-2">
                      {days.map((d) => {
                        const selected = selectedDate === d.dateStr;
                        return (
                          <button
                            key={d.dateStr}
                            type="button"
                            onClick={() => setSelectedDate(d.dateStr)}
                            aria-pressed={selected}
                            aria-label={`${formatDateLabel(d.dateStr)}${d.closed ? ' (gesloten)' : ''}`}
                            className={`flex h-[5.25rem] w-16 flex-col items-center justify-center gap-1 border transition-colors duration-300 ${
                              selected
                                ? 'border-ink bg-ink text-ivory'
                                : d.closed
                                  ? 'border-ink/8 text-stone/45'
                                  : 'border-ink/15 text-ink hover:border-ink/50'
                            }`}
                          >
                            <span className="text-[0.62rem] font-medium uppercase tracking-[0.14em] opacity-70">{d.weekday}</span>
                            <span className="font-display text-[1.6rem] leading-none">{d.dayNum}</span>
                            <span className="text-[0.62rem] uppercase tracking-[0.1em] opacity-60">{d.month}</span>
                          </button>
                        );
                      })}
                      {visibleDayCount < allDays.length && (
                        <button
                          type="button"
                          onClick={() => setVisibleDayCount((c) => Math.min(c + 14, allDays.length))}
                          className="flex h-[5.25rem] w-16 flex-col items-center justify-center gap-1 border border-dashed border-ink/25 text-ink-soft transition-colors hover:border-ink hover:text-ink"
                        >
                          <span className="font-display text-2xl leading-none">+</span>
                          <span className="text-[0.62rem] font-medium uppercase tracking-[0.14em]">Meer</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {error && <p className="mt-6 border-l-2 border-mocha pl-4 text-sm text-mocha">{error}</p>}

                  <div className="mt-10">
                    {loadingSlots && <p className="text-stone">Beschikbare tijden laden…</p>}
                    {!loadingSlots && slots.length === 0 && (
                      <p className="text-stone">Geen beschikbare tijden op deze dag. Kies een andere datum.</p>
                    )}
                    {!loadingSlots && slots.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
                        {slots.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setError('');
                              setTime(s);
                              setStep('details');
                            }}
                            className={`flex h-12 items-center justify-center gap-2 border text-[0.95rem] tabular-nums transition-colors duration-300 ${
                              time === s ? 'border-ink bg-ink text-ivory' : 'border-ink/15 hover:border-ink hover:bg-cream'
                            }`}
                          >
                            {timeIsEvening(s) ? (
                              <Moon aria-hidden="true" className="h-3.5 w-3.5 opacity-50" strokeWidth={1.5} />
                            ) : (
                              <Sun aria-hidden="true" className="h-3.5 w-3.5 opacity-50" strokeWidth={1.5} />
                            )}
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              {step === 'details' && (
                <motion.section key="details" {...panel} aria-labelledby="stap-titel">
                  <h1 id="stap-titel" className="text-[2.5rem] leading-none md:text-[3.5rem]">
                    Laatste stap: <span className="italic">jouw gegevens</span>
                  </h1>
                  <form onSubmit={handleSubmit} className="mt-10 max-w-lg space-y-8">
                    <label className="block">
                      <span className="caps text-mocha">Naam *</span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Voor- en achternaam"
                        autoComplete="name"
                        required
                        maxLength={120}
                        className="mt-2 block w-full rounded-none border-0 border-b border-ink/25 bg-transparent px-0 py-3 text-lg text-ink placeholder:text-stone/60 focus:border-ink focus:outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="caps text-mocha">Telefoonnummer *</span>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="06 12 34 56 78"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        required
                        maxLength={40}
                        className="mt-2 block w-full rounded-none border-0 border-b border-ink/25 bg-transparent px-0 py-3 text-lg text-ink placeholder:text-stone/60 focus:border-ink focus:outline-none"
                      />
                    </label>
                    {error && <p className="border-l-2 border-mocha pl-4 text-sm text-mocha">{error}</p>}
                    <PrimaryButton type="submit" disabled={submitting} className="w-full sm:w-auto">
                      {submitting ? 'Bezig…' : 'Afspraak bevestigen'}
                    </PrimaryButton>
                    <p className="text-sm text-stone">We nemen alleen contact op als er iets wijzigt aan je afspraak.</p>
                  </form>
                </motion.section>
              )}

              {step === 'done' && confirmed && (
                <motion.section key="done" {...panel} aria-labelledby="stap-titel" className="max-w-xl">
                  <span className="flex h-14 w-14 items-center justify-center border border-ink">
                    <Check aria-hidden="true" className="h-6 w-6" strokeWidth={1.4} />
                  </span>
                  <h1 id="stap-titel" className="mt-8 text-[2.75rem] leading-none md:text-[4rem]">
                    Afspraak <span className="italic">bevestigd</span>
                  </h1>
                  <p className="mt-8 text-lg leading-relaxed text-ink-soft">
                    Je afspraak voor <strong className="font-medium text-ink">{confirmed.treatment?.name}</strong> op{' '}
                    <strong className="font-medium text-ink">{formatDateLabel(confirmed.date)}</strong> om{' '}
                    <strong className="font-medium text-ink">{confirmed.time}</strong> uur is ingepland.
                  </p>
                  <p className="mt-4 text-ink-soft">Moet je verzetten of annuleren? {contactFallback}</p>
                  <Link
                    href="/"
                    className="group mt-10 inline-flex min-h-14 items-center justify-between gap-8 rounded-[2px] bg-ink px-7 text-[0.75rem] font-medium uppercase tracking-[0.2em] text-ivory transition-colors duration-500 hover:bg-mocha"
                  >
                    Terug naar de website
                    <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">
                      →
                    </span>
                  </Link>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          <aside aria-label="Jouw afspraak" className="h-fit bg-cream p-7 lg:sticky lg:top-8">
            <h2 className="text-[1.9rem] leading-none">Jouw afspraak</h2>
            <p className="caps mt-3 text-stone">
              {site.name} · {site.city}
            </p>

            <div className="mt-7 border-t border-ink/12">
              {!selectedTreatment && <p className="pt-5 text-sm text-stone">Nog geen dienst gekozen.</p>}

              {selectedTreatment && (
                <div className="flex items-start justify-between gap-4 border-b border-ink/12 py-5">
                  <div>
                    <div className="font-display text-xl leading-tight">{selectedTreatment.name}</div>
                    <div className="mt-1.5 text-sm text-stone">
                      {time ? (
                        <span className="inline-block first-letter:uppercase">
                          {formatDateLabel(selectedDate)} · {time}
                        </span>
                      ) : (
                        `± ${selectedTreatment.duration_minutes} min`
                      )}
                    </div>
                  </div>
                  <div className="whitespace-nowrap text-sm text-ink">
                    {selectedTreatment.price_from !== null ? `€${formatEuro(selectedTreatment.price_from)}` : ''}
                  </div>
                </div>
              )}

              {selectedTreatment && (
                <div className="flex items-baseline justify-between pt-5 text-sm">
                  <span className="caps text-mocha">Subtotaal</span>
                  <span className="font-medium text-ink">
                    {selectedTreatment.price_from !== null
                      ? `€${formatEuro(selectedTreatment.price_from)}`
                      : 'In overleg in de salon'}
                  </span>
                </div>
              )}
            </div>

            {step === 'service' && treatmentId && (
              <div className="mt-7 hidden lg:block">
                <PrimaryButton type="button" onClick={() => setStep('time')} className="w-full">
                  Kies een tijd
                </PrimaryButton>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
