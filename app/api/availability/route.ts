import { NextResponse } from 'next/server';
import { pool, ensureSchema } from '@/lib/db';
import { computeAvailableSlots, dayBoundsUTC } from '@/lib/schedule';
import { DATE_RE, databaseUnavailable } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const unavailable = databaseUnavailable();
  if (unavailable) return unavailable;

  await ensureSchema();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const treatmentId = Number(searchParams.get('treatmentId'));

  if (!date || !DATE_RE.test(date) || !treatmentId) {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 });
  }

  const { rows: treatmentRows } = await pool.query('SELECT duration_minutes FROM treatments WHERE id = $1', [
    treatmentId,
  ]);
  if (treatmentRows.length === 0) {
    return NextResponse.json({ error: 'Behandeling niet gevonden' }, { status: 404 });
  }
  const duration: number = treatmentRows[0].duration_minutes;

  const { start, end } = dayBoundsUTC(date);

  const { rows: busyRows } = await pool.query(
    `SELECT start_time, end_time FROM appointments
     WHERE status != 'cancelled' AND start_time < $2 AND end_time > $1
     UNION ALL
     SELECT start_time, end_time FROM blocked_slots
     WHERE start_time < $2 AND end_time > $1`,
    [start.toISOString(), end.toISOString()]
  );

  const busyIntervals = busyRows.map((r) => ({
    start: new Date(r.start_time),
    end: new Date(r.end_time),
  }));

  const slots = computeAvailableSlots(date, duration, busyIntervals);

  return NextResponse.json({ slots });
}
