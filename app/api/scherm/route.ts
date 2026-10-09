import { NextResponse, type NextRequest } from 'next/server';
import { pool, ensureSchema } from '@/lib/db';
import { ADMIN_COOKIE_NAME, isValidSession } from '@/lib/auth';
import { databaseUnavailable } from '@/lib/api';
import { dayBoundsUTC, toAmsterdamParts } from '@/lib/schedule';
import { firstName, isValidScreenCode } from '@/lib/screen';

export const dynamic = 'force-dynamic';

/** Afspraken van vandaag voor het TV-scherm: alleen tijd en voornaam. */
export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams.get('code');
  const authed = isValidScreenCode(code) || isValidSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
  if (!authed) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 });
  }
  const unavailable = databaseUnavailable();
  if (unavailable) return unavailable;

  await ensureSchema();
  const today = toAmsterdamParts(new Date()).date;
  const { start, end } = dayBoundsUTC(today);
  const { rows } = await pool.query(
    `SELECT id, customer_name, start_time, end_time FROM appointments
     WHERE status != 'cancelled' AND start_time >= $1 AND start_time < $2
     ORDER BY start_time ASC`,
    [start.toISOString(), end.toISOString()]
  );

  return NextResponse.json(
    {
      date: today,
      appointments: rows.map((r) => ({
        id: r.id,
        name: firstName(r.customer_name),
        time: toAmsterdamParts(new Date(r.start_time)).time,
        startIso: new Date(r.start_time).toISOString(),
        endIso: new Date(r.end_time).toISOString(),
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
