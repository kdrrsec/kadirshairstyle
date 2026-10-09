import { NextResponse, after } from 'next/server';
import { pool, ensureSchema } from '@/lib/db';
import { isBookableTime, localToUTC } from '@/lib/schedule';
import { DATE_RE, TIME_RE, databaseUnavailable } from '@/lib/api';
import { notifyBarber } from '@/lib/notify';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const unavailable = databaseUnavailable();
  if (unavailable) return unavailable;

  await ensureSchema();
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 });
  }

  const { treatmentId, date, time, name, phone, email } = body as Record<string, unknown>;

  if (
    !treatmentId ||
    typeof date !== 'string' ||
    typeof time !== 'string' ||
    !DATE_RE.test(date) ||
    !TIME_RE.test(time) ||
    typeof name !== 'string' ||
    typeof phone !== 'string' ||
    !name.trim() ||
    !phone.trim() ||
    name.length > 120 ||
    phone.length > 40
  ) {
    return NextResponse.json({ error: 'Vul alle verplichte velden in.' }, { status: 400 });
  }

  const { rows: treatmentRows } = await pool.query('SELECT name, duration_minutes FROM treatments WHERE id = $1', [
    Number(treatmentId),
  ]);
  if (treatmentRows.length === 0) {
    return NextResponse.json({ error: 'Behandeling niet gevonden' }, { status: 404 });
  }
  const duration: number = treatmentRows[0].duration_minutes;

  if (!isBookableTime(date, time, duration)) {
    return NextResponse.json({ error: 'Dit tijdstip is niet beschikbaar. Kies een andere tijd.' }, { status: 409 });
  }

  const start = localToUTC(date, time);
  const end = new Date(start.getTime() + duration * 60000);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Voorkomt dubbele boekingen bij gelijktijdige aanvragen.
    await client.query('LOCK TABLE appointments IN SHARE ROW EXCLUSIVE MODE');
    const { rows: conflicts } = await client.query(
      `SELECT id FROM appointments
       WHERE status != 'cancelled' AND start_time < $2 AND end_time > $1
       UNION ALL
       SELECT id FROM blocked_slots
       WHERE start_time < $2 AND end_time > $1`,
      [start.toISOString(), end.toISOString()]
    );
    if (conflicts.length > 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Dit tijdstip is helaas net vergeven. Kies een andere tijd.' },
        { status: 409 }
      );
    }

    const { rows } = await client.query(
      `INSERT INTO appointments (treatment_id, customer_name, customer_phone, customer_email, start_time, end_time)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [
        Number(treatmentId),
        name.trim(),
        phone.trim(),
        typeof email === 'string' && email.trim() ? email.trim() : null,
        start.toISOString(),
        end.toISOString(),
      ]
    );
    await client.query('COMMIT');

    after(() =>
      notifyBarber({ name: name.trim(), phone: phone.trim(), treatment: treatmentRows[0].name, date, time })
    );

    return NextResponse.json({ id: rows[0].id });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
