import { NextResponse, type NextRequest } from 'next/server';
import { pool, ensureSchema } from '@/lib/db';
import { computeAvailableSlots, dayBoundsUTC } from '@/lib/schedule';
import { DATE_RE } from '@/lib/api';
import { guardAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** Vrije tijden op een dag voor het verzetten van een afspraak (die afspraak zelf telt niet mee). */
export async function GET(request: NextRequest) {
  const blocked = guardAdmin(request);
  if (blocked) return blocked;
  await ensureSchema();

  const params = new URL(request.url).searchParams;
  const date = params.get('date') || '';
  const id = Number(params.get('id'));
  if (!DATE_RE.test(date) || !id) {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 });
  }

  const { rows: current } = await pool.query(
    `SELECT t.duration_minutes FROM appointments a JOIN treatments t ON t.id = a.treatment_id WHERE a.id = $1`,
    [id]
  );
  if (current.length === 0) {
    return NextResponse.json({ error: 'Afspraak niet gevonden.' }, { status: 404 });
  }

  const { start, end } = dayBoundsUTC(date);
  const { rows: busy } = await pool.query(
    `SELECT start_time, end_time FROM appointments
     WHERE id != $3 AND status != 'cancelled' AND start_time < $2 AND end_time > $1
     UNION ALL
     SELECT start_time, end_time FROM blocked_slots WHERE start_time < $2 AND end_time > $1`,
    [start.toISOString(), end.toISOString(), id]
  );
  const slots = computeAvailableSlots(
    date,
    current[0].duration_minutes,
    busy.map((r) => ({ start: new Date(r.start_time), end: new Date(r.end_time) }))
  );
  return NextResponse.json({ slots });
}
