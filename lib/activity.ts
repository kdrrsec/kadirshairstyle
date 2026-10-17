/**
 * Logboek van de agenda: wie wat wanneer heeft gedaan (nieuwe afspraak, verzet,
 * verwijderd, teruggezet, geblokkeerd), en via welke weg: website, beheer of WhatsApp.
 * Te zien in het beheer onder "Logboek". Wordt net als afspraken na 6 maanden gewist.
 */
import { pool } from '@/lib/db';
import { toAmsterdamParts } from '@/lib/schedule';

export type ActivitySource = 'website' | 'beheer' | 'whatsapp';
export type ActivityAction =
  | 'nieuw'
  | 'verzet'
  | 'verwijderd'
  | 'geannuleerd'
  | 'teruggezet'
  | 'geblokkeerd'
  | 'vrijgegeven';

/** Korte omschrijving van een afspraak, bijv. "Jan – Knippen · di 20 okt 11:00". */
export function appointmentSummary(name: string, treatment: string, start: Date | string) {
  const d = new Date(start);
  const { time } = toAmsterdamParts(d);
  const day = new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(d);
  return `${name} – ${treatment} · ${day.replace(/\./g, '')} ${time}`;
}

/** Schrijft een regel in het logboek. Mislukt dit, dan gaat de actie zelf gewoon door. */
export async function logActivity(
  source: ActivitySource,
  action: ActivityAction,
  summary: string,
  appointmentId: number | null = null
) {
  try {
    await pool.query(
      'INSERT INTO activity_log (source, action, appointment_id, summary) VALUES ($1, $2, $3, $4)',
      [source, action, appointmentId, summary.slice(0, 300)]
    );
  } catch (err) {
    console.error('Logboek bijwerken mislukt:', err);
  }
}
