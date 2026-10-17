/**
 * Leest de WhatsApp-berichten van de kapper (agenda beheren via WhatsApp).
 * Alleen tekst ontleden, geen database: zie lib/whatsapp-commands.ts.
 *
 *   AFSPRAAK 11-11 11:15 Jan Jansen knippen
 *   BLOKKEER 24-10            BLOKKEER 24-10 13:00-17:00      BLOKKEER 24-10 t/m 26-10
 *   VRIJ 24-10
 *   AGENDA 11-11   VANDAAG   MORGEN
 *   ANNULEER 42
 *   HELP
 */

export type TreatmentRef = { slug: string; name: string; tag?: string; aliases?: readonly string[] };

export type Command =
  | { kind: 'help' }
  | { kind: 'agenda'; date: string }
  | { kind: 'block'; from: string; to: string; startTime?: string; endTime?: string; reason?: string }
  | { kind: 'unblock'; from: string; to: string }
  | { kind: 'book'; date: string; time: string; name: string; treatment: string; phone?: string }
  | { kind: 'ask-time'; date: string; name: string; treatment?: string; phone?: string }
  | { kind: 'cancel'; id: number }
  | { kind: 'error'; message: string }
  | { kind: 'none' };

const WORDS: Record<string, Command['kind']> = {
  afspraak: 'book',
  boek: 'book',
  boeken: 'book',
  inplannen: 'book',
  plan: 'book',
  blokkeer: 'block',
  blokkeren: 'block',
  dicht: 'block',
  sluit: 'block',
  vrij: 'unblock',
  open: 'unblock',
  deblokkeer: 'unblock',
  agenda: 'agenda',
  overzicht: 'agenda',
  annuleer: 'cancel',
  annuleren: 'cancel',
  verwijder: 'cancel',
  help: 'help',
  hulp: 'help',
  menu: 'help',
  info: 'help',
  '?': 'help',
};

const MONTHS: Record<string, number> = {
  jan: 1, januari: 1, feb: 2, februari: 2, mrt: 3, maart: 3, apr: 4, april: 4, mei: 5,
  jun: 6, juni: 6, jul: 7, juli: 7, aug: 8, augustus: 8, sep: 9, sept: 9, september: 9,
  okt: 10, oktober: 10, nov: 11, november: 11, dec: 12, december: 12,
};

const WEEKDAYS: Record<string, number> = {
  zondag: 0, zo: 0, maandag: 1, ma: 1, dinsdag: 2, di: 2, woensdag: 3, wo: 3,
  donderdag: 4, do: 4, vrijdag: 5, vr: 5, zaterdag: 6, za: 6,
};

// Opvulwoorden rond datum en tijd ("morgen een afspraak om 11:15 uur").
const FILLER = new Set(['om', 'op', 'een', 'afspraak', 'voor', 'uur', 'u', 'van', 'de', 'het', 'is', 'graag']);
// Na de tijd alleen deze overslaan, zodat namen als "van Dijk" heel blijven.
const AFTER_TIME = new Set(['uur', 'u', 'voor']);

const pad = (n: number) => String(n).padStart(2, '0');

export function addDaysISO(date: string, days: number) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days, 12)).toISOString().slice(0, 10);
}

function weekdayOf(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

function validDate(y: number, m: number, d: number) {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  if (dt.getUTCMonth() !== m - 1) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Datum zonder jaartal: dit jaar, of volgend jaar als die dag al geweest is. */
function withYear(m: number, d: number, today: string) {
  const year = Number(today.slice(0, 4));
  const thisYear = validDate(year, m, d);
  if (thisYear && thisYear >= today) return thisYear;
  return validDate(year + 1, m, d) || thisYear;
}

const clean = (t: string) => t.toLowerCase().replace(/[,;!]+$/g, '');

/** Probeert op positie i een datum te lezen. Geeft de datum en de volgende positie terug. */
export function takeDate(tokens: string[], i: number, today: string): { date: string; next: number } | null {
  const t = clean(tokens[i] || '');
  if (!t) return null;
  if (t === 'vandaag') return { date: today, next: i + 1 };
  if (t === 'morgen') return { date: addDaysISO(today, 1), next: i + 1 };
  if (t === 'overmorgen') return { date: addDaysISO(today, 2), next: i + 1 };
  if (t in WEEKDAYS && t.length > 2) {
    const diff = (WEEKDAYS[t] - weekdayOf(today) + 7) % 7;
    return { date: addDaysISO(today, diff), next: i + 1 };
  }
  let m = t.match(/^(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{2}|\d{4}))?$/);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const date = m[3] ? validDate(m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]), mo, d) : withYear(mo, d, today);
    return date ? { date, next: i + 1 } : null;
  }
  // "11 november" / "11 nov"
  m = t.match(/^(\d{1,2})$/);
  const month = clean(tokens[i + 1] || '').replace(/\.$/, '');
  if (m && month in MONTHS) {
    const date = withYear(MONTHS[month], Number(m[1]), today);
    return date ? { date, next: i + 2 } : null;
  }
  return null;
}

function parseTime(t: string) {
  const m = clean(t).match(/^(\d{1,2})(?:[:.u](\d{2})|u)$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  if (h > 23 || min > 59) return null;
  return `${pad(h)}:${pad(min)}`;
}

/** Tijd of tijdvak op positie i: "11:15", "13:00-17:00", "13:00 - 17:00", "13:00 tot 17:00". */
function takeTimeRange(tokens: string[], i: number) {
  const t = clean(tokens[i] || '');
  const single = t.match(/^(.+?)-(.+)$/);
  if (single) {
    const a = parseTime(single[1]);
    const b = parseTime(single[2]);
    if (a && b) return { start: a, end: b, next: i + 1 };
  }
  const a = parseTime(t);
  if (!a) return null;
  // "13:00 tot 17:00" of "13:00 - 17:00" (losse streepjes zijn al weggefilterd)
  if (clean(tokens[i + 1] || '') === 'tot') {
    const b = parseTime(tokens[i + 2] || '');
    if (b) return { start: a, end: b, next: i + 3 };
  }
  const b = parseTime(tokens[i + 1] || '');
  if (b) return { start: a, end: b, next: i + 2 };
  return { start: a, end: undefined, next: i + 1 };
}

export function normalizeWords(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[&+/,.()-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && w !== 'en' && w !== 'met')
    .join(' ');
}

function treatmentKeys(t: TreatmentRef) {
  return [t.slug.replace(/-/g, ' '), t.name, t.tag || '', ...(t.aliases || [])].map(normalizeWords).filter(Boolean);
}

/** Zoekt een behandeling bij de (begin van de) naam, slug, tag of een alias. */
export function findTreatment(text: string, treatments: readonly TreatmentRef[]) {
  const q = normalizeWords(text);
  if (!q) return null;
  const exact = treatments.find((t) => treatmentKeys(t).includes(q));
  if (exact) return exact;
  if (q.length < 3) return null;
  let best: { t: TreatmentRef; len: number } | null = null;
  for (const t of treatments) {
    for (const k of treatmentKeys(t)) {
      if (k.startsWith(q) && (!best || k.length < best.len)) best = { t, len: k.length };
    }
  }
  return best?.t || null;
}

function treatmentList(treatments: readonly TreatmentRef[]) {
  return treatments.map((t) => `• ${t.name}`).join('\n');
}

/** "10 uur", "10u" of "om 10" → 10:00. */
function hourOnly(tokens: string[], i: number) {
  const t = clean(tokens[i] || '');
  if (!/^\d{1,2}$/.test(t)) return null;
  const h = Number(t);
  if (h < 6 || h > 22) return null;
  const nextWord = clean(tokens[i + 1] || '');
  const prevWord = clean(tokens[i - 1] || '');
  if (nextWord === 'uur' || nextWord === 'u' || prevWord === 'om') return `${pad(h)}:00`;
  return null;
}

/** Bevat het bericht zowel een datum als een tijd? */
function looksLikeBooking(tokens: string[], today: string) {
  let hasDate = false;
  let hasTime = false;
  for (let k = 0; k < tokens.length; k++) {
    const d = takeDate(tokens, k, today);
    if (d) {
      hasDate = true;
      k = d.next - 1;
      continue;
    }
    if (parseTime(tokens[k]) || hourOnly(tokens, k)) hasTime = true;
  }
  return hasDate && hasTime;
}

function isPhoneToken(t: string) {
  return /^\+?\d[\d-]{8,}$/.test(t.replace(/[()]/g, ''));
}

export function parseCommand(text: string, today: string, treatments: readonly TreatmentRef[]): Command {
  const tokens = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((t) => t && t !== '-' && t !== ',');
  if (tokens.length === 0) return { kind: 'none' };

  const first = clean(tokens[0]).replace(/[^a-z?]/g, '');
  let kind = WORDS[first];
  let i = 1;

  // "MORGEN", "VANDAAG", "vrijdag" als los bericht = agenda van die dag
  if (!kind) {
    const d = takeDate(tokens, 0, today);
    if (d && d.next === tokens.length) return { kind: 'agenda', date: d.date };
  }
  if (!kind && looksLikeBooking(tokens, today)) {
    // "morgen 11:00 Jan knippen" zonder AFSPRAAK ervoor: ook gewoon inplannen.
    kind = 'book';
    i = 0;
  }
  if (!kind) {
    // Geen bekend commando. Staat er een datum of tijd in, dan was het waarschijnlijk een poging: uitleg terug.
    return /\d{1,2}[:.\-/]\d{1,2}/.test(text)
      ? { kind: 'error', message: 'Dat begreep ik niet. Stuur *HELP* voor alle mogelijkheden.' }
      : { kind: 'none' };
  }

  const skipFiller = (words = FILLER) => {
    while (i < tokens.length && words.has(clean(tokens[i]))) i++;
  };

  if (kind === 'help') return { kind: 'help' };

  if (kind === 'cancel') {
    const id = Number((tokens[i] || '').replace(/^#/, ''));
    return Number.isInteger(id) && id > 0
      ? { kind: 'cancel', id }
      : { kind: 'error', message: 'Welke afspraak? Bijvoorbeeld: *ANNULEER 42* (het nummer staat in de agenda en bevestiging).' };
  }

  if (kind === 'agenda') {
    skipFiller();
    const d = takeDate(tokens, i, today);
    return { kind: 'agenda', date: d ? d.date : today };
  }

  if (kind === 'block' || kind === 'unblock') {
    skipFiller();
    const from = takeDate(tokens, i, today);
    if (!from) {
      return {
        kind: 'error',
        message:
          kind === 'block'
            ? 'Welke dag? Bijvoorbeeld: *BLOKKEER 24-10* of *BLOKKEER 24-10 13:00-17:00*'
            : 'Welke dag? Bijvoorbeeld: *VRIJ 24-10*',
      };
    }
    i = from.next;
    let to = from.date;
    const sep = clean(tokens[i] || '');
    if (sep === 't/m' || sep === 'tm' || sep === 'tot') {
      const end = takeDate(tokens, i + 1, today);
      if (end) {
        to = end.date;
        i = end.next;
      }
    }
    if (to < from.date) return { kind: 'error', message: 'De einddatum ligt vóór de begindatum.' };
    if (kind === 'unblock') return { kind: 'unblock', from: from.date, to };

    const range = takeTimeRange(tokens, i);
    let startTime: string | undefined;
    let endTime: string | undefined;
    if (range) {
      if (!range.end) return { kind: 'error', message: 'Geef een begin- én eindtijd, bijvoorbeeld *BLOKKEER 24-10 13:00-17:00*' };
      if (range.end <= range.start) return { kind: 'error', message: 'De eindtijd moet na de begintijd liggen.' };
      startTime = range.start;
      endTime = range.end;
      i = range.next;
    }
    const reason = tokens.slice(i).join(' ').trim() || undefined;
    return { kind: 'block', from: from.date, to, startTime, endTime, reason };
  }

  // kind === 'book'
  skipFiller();
  let date: string | null = null;
  let time: string | null = null;
  // Datum en tijd mogen in beide volgordes staan ("11-11 11:15" of "11:15 morgen").
  for (let round = 0; round < 2; round++) {
    skipFiller();
    if (!date) {
      const d = takeDate(tokens, i, today);
      if (d) {
        date = d.date;
        i = d.next;
        continue;
      }
    }
    if (!time) {
      const t = parseTime(tokens[i] || '') || hourOnly(tokens, i);
      if (t) {
        time = t;
        i++;
      }
    }
  }
  skipFiller(AFTER_TIME);
  const usage = 'Bijvoorbeeld: *AFSPRAAK 11-11 11:15 Jan Jansen knippen*';
  if (!date) return { kind: 'error', message: `Welke dag? ${usage}` };
  // Zonder tijd: niet inplannen maar de vrije tijden van die dag terugsturen (zie whatsapp-commands).

  let rest = tokens.slice(i);
  // Telefoonnummer (los of als "06 12345678") eruit halen
  let phone: string | undefined;
  for (let k = 0; k < rest.length; k++) {
    const joined = /^0\d$/.test(rest[k]) && /^\d{8}$/.test(rest[k + 1] || '') ? rest[k] + rest[k + 1] : null;
    if (joined) {
      phone = joined;
      rest = [...rest.slice(0, k), ...rest.slice(k + 2)];
      break;
    }
    if (isPhoneToken(rest[k])) {
      phone = rest[k];
      rest = [...rest.slice(0, k), ...rest.slice(k + 1)];
      break;
    }
  }

  // Behandeling = de laatste 1-3 woorden, of anders de eerste 1-3 woorden ("knippen Jan").
  let treatment: TreatmentRef | null = null;
  let nameTokens = rest;
  for (let k = Math.min(3, rest.length); k >= 1; k--) {
    const found = findTreatment(rest.slice(-k).join(' '), treatments);
    if (found) {
      treatment = found;
      nameTokens = rest.slice(0, -k);
      break;
    }
  }
  if (!treatment) {
    for (let k = Math.min(3, rest.length); k >= 1; k--) {
      const found = findTreatment(rest.slice(0, k).join(' '), treatments);
      if (found) {
        treatment = found;
        nameTokens = rest.slice(k);
        break;
      }
    }
  }
  if (!treatment && treatments.length === 1) treatment = treatments[0];
  if (!time) {
    let first = 0;
    while (first < nameTokens.length && FILLER.has(clean(nameTokens[first]))) first++;
    const who = nameTokens.slice(first).join(' ').replace(/[,;:]+$/, '').trim();
    return { kind: 'ask-time', date, name: /\p{L}/u.test(who) ? who.slice(0, 120) : '', treatment: treatment?.slug, phone };
  }
  if (!treatment) {
    return { kind: 'error', message: `Welke behandeling? Kies uit:\n${treatmentList(treatments)}\n\n${usage}` };
  }
  // Alleen opvulwoorden vóóraan weghalen ("voor Jan"), zodat "van Dijk" heel blijft.
  let start = 0;
  while (start < nameTokens.length && FILLER.has(clean(nameTokens[start]))) start++;
  const typed = nameTokens
    .slice(start)
    .join(' ')
    .replace(/[,;:]+$/, '')
    .trim();
  // Zonder naam toch inplannen; de kapper ziet het dan als "Klant" in de agenda.
  const name = /\p{L}/u.test(typed) ? typed : 'Klant';

  return { kind: 'book', date, time, name: name.slice(0, 120), treatment: treatment.slug, phone };
}

export const HELP_TEXT = [
  '✂️ *Agenda via WhatsApp*',
  '',
  '*AFSPRAAK 11-11 11:15 Jan Jansen knippen*',
  'Afspraak inplannen (telefoonnummer erachter mag ook).',
  '',
  '*BLOKKEER 24-10*  hele dag dicht',
  '*BLOKKEER 24-10 13:00-17:00*  deel van de dag',
  '*BLOKKEER 24-10 t/m 26-10*  meerdere dagen',
  '*VRIJ 24-10*  blokkade weghalen',
  '',
  '*VANDAAG*, *MORGEN* of *AGENDA 11-11*  afspraken van die dag',
  '*ANNULEER 42*  afspraak 42 annuleren',
  '',
  'Datum mag ook als _morgen_, _vrijdag_ of _11 november_.',
].join('\n');
