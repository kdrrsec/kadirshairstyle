import { site, type DayKey } from '@/content/site';

const TIMEZONE = 'Europe/Amsterdam';

// 0 = zondag ... 6 = zaterdag
const WEEKDAY_KEYS: DayKey[] = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

const SLOT_STEP_MINUTES = 15;
const MIN_LEAD_MINUTES = 30;

export type Interval = { start: Date; end: Date };

function getOffsetMinutes(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' });
  const part = dtf.formatToParts(date).find((p) => p.type === 'timeZoneName')?.value || 'GMT+1';
  const match = part.match(/GMT([+-])(\d+)(?::(\d+))?/);
  if (!match) return 60;
  const sign = match[1] === '-' ? -1 : 1;
  const hours = parseInt(match[2], 10);
  const mins = match[3] ? parseInt(match[3], 10) : 0;
  return sign * (hours * 60 + mins);
}

export function localToUTC(dateStr: string, timeStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const naiveUTC = new Date(Date.UTC(y, m - 1, d, hh, mm));
  const offset = getOffsetMinutes(naiveUTC, TIMEZONE);
  return new Date(naiveUTC.getTime() - offset * 60000);
}

/** Datum (YYYY-MM-DD) en tijd (HH:MM) van een moment in Amsterdamse tijd. */
export function toAmsterdamParts(d: Date) {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(d);
  const time = new Intl.DateTimeFormat('nl-NL', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
  return { date, time };
}

export function weekdayForDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d, 12));
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, weekday: 'short' }).format(probe);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[wd];
}

export function dayBoundsUTC(dateStr: string) {
  const start = localToUTC(dateStr, '00:00');
  const [y, m, d] = dateStr.split('-').map(Number);
  const nextDay = new Date(Date.UTC(y, m - 1, d + 1, 0, 0));
  const nextDateStr = nextDay.toISOString().slice(0, 10);
  const end = localToUTC(nextDateStr, '00:00');
  return { start, end };
}

function timeStrToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function hoursForDate(dateStr: string) {
  return site.hours[WEEKDAY_KEYS[weekdayForDate(dateStr)]];
}

export function computeAvailableSlots(
  dateStr: string,
  durationMinutes: number,
  busyIntervals: Interval[],
  now = new Date()
) {
  const hours = hoursForDate(dateStr);
  if (!hours) return [];

  const openMin = timeStrToMinutes(hours.open);
  const closeMin = timeStrToMinutes(hours.close);

  const slots: string[] = [];
  for (let m = openMin; m + durationMinutes <= closeMin; m += SLOT_STEP_MINUTES) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    const timeStr = `${hh}:${mm}`;
    const start = localToUTC(dateStr, timeStr);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    if (start.getTime() < now.getTime() + MIN_LEAD_MINUTES * 60000) continue;

    const overlaps = busyIntervals.some(
      (b) => start.getTime() < b.end.getTime() && end.getTime() > b.start.getTime()
    );
    if (!overlaps) slots.push(timeStr);
  }
  return slots;
}

/** Controleert of een tijd binnen openingstijden en het slotraster valt. */
export function isBookableTime(dateStr: string, timeStr: string, durationMinutes: number, now = new Date()) {
  return computeAvailableSlots(dateStr, durationMinutes, [], now).includes(timeStr);
}
