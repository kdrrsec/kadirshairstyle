import { NextResponse } from 'next/server';
import { pool, ensureSchema } from '@/lib/db';
import { databaseUnavailable } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const unavailable = databaseUnavailable();
  if (unavailable) return unavailable;

  await ensureSchema();
  const { rows } = await pool.query(
    'SELECT id, slug, name, duration_minutes, price_from FROM treatments ORDER BY sort_order ASC'
  );
  return NextResponse.json({
    treatments: rows.map((r) => ({
      ...r,
      price_from: r.price_from === null ? null : Number(r.price_from),
    })),
  });
}
