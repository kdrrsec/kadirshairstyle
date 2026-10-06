import { NextResponse, type NextRequest } from 'next/server';
import { pool, ensureSchema } from '@/lib/db';
import { localToUTC, toAmsterdamParts, dayBoundsUTC } from '@/lib/schedule';
import { DATE_RE, TIME_RE } from '@/lib/api';
import { addDays, guardAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

type Row = {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  start_time: Date;
  end_time: Date;
  treatment_id: number;
  treatment_name: string;
  duration_minutes: number;
};

function serialize(r: Row) {
  const start = toAmsterdamParts(new Date(r.start_time));
  const end = toAmsterdamParts(new Date(r.end_time));
  return {
    id: r.id,
    name: r.customer_name,
    phone: r.customer_phone,
    email: r.customer_email,
    date: start.date,
    time: start.time,
    endTime: end.time,
    startIso: new Date(r.start_time).toISOString(),
    endIso: new Date(r.end_time).toISOString(),
    treatmentId: r.treatment_id,
    treatment: r.treatment_name,
    duration: r.duration_minutes,
  };
}

/** Afspraken in een periode (standaard: 30 dagen terug tot 120 dagen vooruit). */
export async function GET(request: NextRequest) {
  const blocked = guardAdmin(request);
  if (blocked) return blocked;
  await ensureSchema();

  const params = new URL(request.url).searchParams;
  const today = toAmsterdamParts(new Date()).date;
  const from = DATE_RE.test(params.get('from') || '') ? params.get('from')! : addDays(today, -30);
  const to = DATE_RE.test(params.get('to') || '') ? params.get('to')! : addDays(today, 120);

  const { rows } = await pool.query<Row>(
    `SELECT a.id, a.customer_name, a.customer_phone, a.customer_email, a.start_time, a.end_time,
            a.treatment_id, t.name AS treatment_name, t.duration_minutes
     FROM appointments a
     JOIN treatments t ON t.id = a.treatment_id
     WHERE a.status != 'cancelled' AND a.start_time >= $1 AND a.start_time < $2
     ORDER BY a.start_time ASC`,
    [dayBoundsUTC(from).start.toISOString(), dayBoundsUTC(to).end.toISOString()]
  );
  return NextResponse.json({ appointments: rows.map(serialize) });
}

/** Afspraak verzetten naar een nieuwe datum/tijd. */
export async function PATCH(request: NextRequest) {
  const blocked = guardAdmin(request);
  if (blocked) return blocked;
  await ensureSchema();

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  const date = body?.date;
  const time = body?.time;
  if (!id || typeof date !== 'string' || typeof time !== 'string' || !DATE_RE.test(date) || !TIME_RE.test(time)) {
    return NextResponse.json({ error: 'Kies een geldige datum en tijd.' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE appointments IN SHARE ROW EXCLUSIVE MODE');
    const { rows: current } = await client.query(
      `SELECT a.id, t.duration_minutes FROM appointments a
       JOIN treatments t ON t.id = a.treatment_id
       WHERE a.id = $1 AND a.status != 'cancelled'`,
      [id]
    );
    if (current.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Afspraak niet gevonden.' }, { status: 404 });
    }
    const start = localToUTC(date, time);
    const end = new Date(start.getTime() + current[0].duration_minutes * 60000);

    const { rows: conflicts } = await client.query(
      `SELECT id FROM appointments
       WHERE id != $3 AND status != 'cancelled' AND start_time < $2 AND end_time > $1
       UNION ALL
       SELECT id FROM blocked_slots WHERE start_time < $2 AND end_time > $1`,
      [start.toISOString(), end.toISOString(), id]
    );
    if (conflicts.length > 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Op dit tijdstip staat al een andere afspraak. Kies een andere tijd.' },
        { status: 409 }
      );
    }

    await client.query('UPDATE appointments SET start_time = $2, end_time = $3 WHERE id = $1', [
      id,
      start.toISOString(),
      end.toISOString(),
    ]);
    await client.query('COMMIT');
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Afspraak definitief verwijderen. */
export async function DELETE(request: NextRequest) {
  const blocked = guardAdmin(request);
  if (blocked) return blocked;

  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!id) {
    return NextResponse.json({ error: 'Ongeldig ID' }, { status: 400 });
  }
  await ensureSchema();
  await pool.query('DELETE FROM appointments WHERE id = $1', [id]);
  return NextResponse.json({ ok: true });
}
