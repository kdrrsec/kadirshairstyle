import { NextResponse, type NextRequest } from 'next/server';
import { pool, ensureSchema } from '@/lib/db';
import { isValidSession, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { databaseUnavailable } from '@/lib/api';

export const dynamic = 'force-dynamic';

function requireAuth(request: NextRequest) {
  return isValidSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }
  const unavailable = databaseUnavailable();
  if (unavailable) return unavailable;

  await ensureSchema();
  const { rows } = await pool.query(
    `SELECT a.id, a.customer_name, a.customer_phone, a.customer_email,
            a.start_time, a.end_time, a.status, t.name AS treatment_name
     FROM appointments a
     JOIN treatments t ON t.id = a.treatment_id
     WHERE a.end_time > now() - interval '1 day'
     ORDER BY a.start_time ASC`
  );
  return NextResponse.json({ appointments: rows });
}

export async function DELETE(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }
  const unavailable = databaseUnavailable();
  if (unavailable) return unavailable;

  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!id) {
    return NextResponse.json({ error: 'Ongeldig ID' }, { status: 400 });
  }
  await ensureSchema();
  await pool.query("UPDATE appointments SET status = 'cancelled' WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
