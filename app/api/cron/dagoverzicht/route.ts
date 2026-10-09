import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { pool, ensureSchema } from '@/lib/db';
import { databaseUnavailable } from '@/lib/api';
import { dayBoundsUTC, hoursForDate, toAmsterdamParts } from '@/lib/schedule';
import { dailyOverviewText, sendWhatsApp } from '@/lib/notify';

export const dynamic = 'force-dynamic';

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get('authorization') || '';
  if (!secret) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Elke ochtend (Vercel Cron): WhatsApp naar de kapper met alle afspraken van vandaag. */
export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 });
  }
  const unavailable = databaseUnavailable();
  if (unavailable) return unavailable;

  const today = toAmsterdamParts(new Date()).date;
  // Op gesloten dagen geen bericht.
  if (!hoursForDate(today)) return NextResponse.json({ sent: false, reason: 'gesloten' });

  await ensureSchema();
  const { start, end } = dayBoundsUTC(today);
  const { rows } = await pool.query(
    `SELECT a.customer_name, a.customer_phone, a.start_time, t.name AS treatment
     FROM appointments a JOIN treatments t ON t.id = a.treatment_id
     WHERE a.status != 'cancelled' AND a.start_time >= $1 AND a.start_time < $2
     ORDER BY a.start_time ASC`,
    [start.toISOString(), end.toISOString()]
  );

  const text = dailyOverviewText(
    today,
    rows.map((r) => ({
      time: toAmsterdamParts(new Date(r.start_time)).time,
      name: r.customer_name,
      treatment: r.treatment,
      phone: r.customer_phone,
    }))
  );
  const sent = await sendWhatsApp(text);
  return NextResponse.json({ sent, count: rows.length });
}
