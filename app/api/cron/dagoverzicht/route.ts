import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { databaseUnavailable } from '@/lib/api';
import { hoursForDate, toAmsterdamParts } from '@/lib/schedule';
import { sendDailyOverview } from '@/lib/overview';

export const dynamic = 'force-dynamic';

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get('authorization') || '';
  if (!secret) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Elke ochtend (Vercel Cron): WhatsApp naar de kapper met alle afspraken van vandaag. */
export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 });
  }
  const unavailable = databaseUnavailable();
  if (unavailable) return unavailable;

  // Op gesloten dagen geen bericht.
  if (!hoursForDate(toAmsterdamParts(new Date()).date)) {
    return NextResponse.json({ sent: false, reason: 'gesloten' });
  }
  return NextResponse.json(await sendDailyOverview());
}
