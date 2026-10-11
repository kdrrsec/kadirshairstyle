import { NextResponse, after } from 'next/server';
import { pool, ensureSchema } from '@/lib/db';
import { isBookableTime, localToUTC } from '@/lib/schedule';
import { DATE_RE, TIME_RE, databaseUnavailable } from '@/lib/api';
import { notifyBarber } from '@/lib/notify';
import { normalizePhone } from '@/lib/phone';
import { LIMITS, clientIp, hashIp, tooManyAttempts } from '@/lib/antispam';
import { verifyTurnstile } from '@/lib/turnstile';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const unavailable = databaseUnavailable();
  if (unavailable) return unavailable;

  await ensureSchema();
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 });
  }

  const { treatmentId, date, time, name, phone, email, website, elapsedMs, turnstileToken } = body as Record<
    string,
    unknown
  >;

  // Anti-spam: verborgen veld (alleen bots vullen het in) en te snel ingevuld formulier.
  if ((typeof website === 'string' && website.trim()) || typeof elapsedMs !== 'number' || elapsedMs < LIMITS.minFillMs) {
    return NextResponse.json({ error: 'Je aanvraag kon niet worden verwerkt. Probeer het opnieuw.' }, { status: 400 });
  }

  const ip = clientIp(request);
  const ipHash = hashIp(ip);
  if (await tooManyAttempts(ipHash)) {
    return NextResponse.json(
      { error: 'Te veel pogingen achter elkaar. Probeer het over een paar minuten opnieuw.' },
      { status: 429 }
    );
  }

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json(
      { error: 'Bevestig eerst dat je geen robot bent (het vinkje boven de knop).', code: 'turnstile' },
      { status: 400 }
    );
  }

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

  const cleanName = name.trim().replace(/\s+/g, ' ');
  if (cleanName.length < 2 || !/\p{L}/u.test(cleanName) || /https?:|www\.|[<>]/i.test(cleanName)) {
    return NextResponse.json({ error: 'Vul je naam in.' }, { status: 400 });
  }

  const phoneCheck = normalizePhone(phone);
  if (!phoneCheck.ok) {
    return NextResponse.json({ error: phoneCheck.error }, { status: 400 });
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
    // Niet te veel openstaande afspraken op één nummer, en niet te veel boekingen vanaf één IP.
    const { rows: limits } = await client.query(
      `SELECT
         (SELECT count(*)::int FROM appointments
          WHERE phone_e164 = $1 AND status != 'cancelled' AND end_time > now()) AS upcoming,
         (SELECT count(*)::int FROM appointments
          WHERE ip_hash = $2 AND created_at > now() - interval '1 day') AS today`,
      [phoneCheck.e164, ipHash]
    );
    if (limits[0].upcoming >= LIMITS.upcomingPerPhone) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        {
          error: `Op dit telefoonnummer staan al ${limits[0].upcoming} afspraken. Wil je iets wijzigen of nog een afspraak maken? Neem dan contact op met de salon.`,
        },
        { status: 429 }
      );
    }
    if (limits[0].today >= LIMITS.bookingsPerIpPerDay) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Je hebt vandaag al meerdere afspraken gemaakt. Neem contact op met de salon voor nog een afspraak.' },
        { status: 429 }
      );
    }

    if (conflicts.length > 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Dit tijdstip is helaas net vergeven. Kies een andere tijd.' },
        { status: 409 }
      );
    }

    const { rows } = await client.query(
      `INSERT INTO appointments
         (treatment_id, customer_name, customer_phone, customer_email, start_time, end_time, phone_e164, ip_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [
        Number(treatmentId),
        cleanName,
        phoneCheck.display,
        typeof email === 'string' && email.trim() ? email.trim() : null,
        start.toISOString(),
        end.toISOString(),
        phoneCheck.e164,
        ipHash,
      ]
    );
    await client.query('COMMIT');

    after(() =>
      notifyBarber({ name: cleanName, phone: phoneCheck.display, treatment: treatmentRows[0].name, date, time })
    );

    return NextResponse.json({ id: rows[0].id });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
