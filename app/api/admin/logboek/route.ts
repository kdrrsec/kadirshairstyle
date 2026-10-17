import { NextResponse, type NextRequest } from 'next/server';
import { guardAdmin } from '@/lib/admin';
import { pool, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Laatste wijzigingen in de agenda, nieuwste eerst. */
export async function GET(request: NextRequest) {
  const blocked = guardAdmin(request);
  if (blocked) return blocked;
  await ensureSchema();

  const { rows } = await pool.query(
    `SELECT l.id, l.created_at, l.source, l.action, l.appointment_id, l.summary, a.status
     FROM activity_log l
     LEFT JOIN appointments a ON a.id = l.appointment_id
     ORDER BY l.created_at DESC
     LIMIT 200`
  );
  return NextResponse.json({
    entries: rows.map((r) => ({
      id: r.id,
      at: new Date(r.created_at).toISOString(),
      source: r.source,
      action: r.action,
      appointmentId: r.appointment_id,
      summary: r.summary,
      // Alleen bij een (nog steeds) geannuleerde afspraak kan "terugzetten".
      restorable: r.appointment_id !== null && r.status === 'cancelled' && (r.action === 'verwijderd' || r.action === 'geannuleerd'),
    })),
  });
}
