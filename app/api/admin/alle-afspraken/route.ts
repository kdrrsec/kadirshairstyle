import { NextResponse, type NextRequest } from 'next/server';
import { guardAdmin } from '@/lib/admin';
import { pool, ensureSchema } from '@/lib/db';
import { toAmsterdamParts } from '@/lib/schedule';

export const dynamic = 'force-dynamic';

/** Alle afspraken (ook geannuleerde), nieuwste nummer eerst. */
export async function GET(request: NextRequest) {
  const blocked = guardAdmin(request);
  if (blocked) return blocked;
  await ensureSchema();

  const { rows } = await pool.query(
    `SELECT a.id, a.customer_name, a.customer_phone, a.start_time, a.end_time, a.status, a.created_at,
            t.name AS treatment_name
     FROM appointments a
     JOIN treatments t ON t.id = a.treatment_id
     ORDER BY a.id DESC
     LIMIT 500`
  );
  return NextResponse.json({
    appointments: rows.map((r) => {
      const start = toAmsterdamParts(new Date(r.start_time));
      return {
        id: r.id,
        name: r.customer_name,
        phone: r.customer_phone,
        treatment: r.treatment_name,
        date: start.date,
        time: start.time,
        endTime: toAmsterdamParts(new Date(r.end_time)).time,
        startIso: new Date(r.start_time).toISOString(),
        createdAt: new Date(r.created_at).toISOString(),
        cancelled: r.status === 'cancelled',
      };
    }),
  });
}
