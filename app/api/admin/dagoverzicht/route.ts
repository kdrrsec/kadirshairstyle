import { NextResponse, type NextRequest } from 'next/server';
import { guardAdmin } from '@/lib/admin';
import { sendDailyOverview } from '@/lib/overview';
import { whatsappConfigured } from '@/lib/notify';

export const dynamic = 'force-dynamic';

/** Beheer: het dagoverzicht nu (opnieuw) via WhatsApp versturen. */
export async function POST(request: NextRequest) {
  const denied = guardAdmin(request);
  if (denied) return denied;

  if (!whatsappConfigured()) {
    return NextResponse.json({ error: 'WhatsApp is nog niet ingesteld.' }, { status: 503 });
  }
  const result = await sendDailyOverview();
  if (!result.sent) {
    return NextResponse.json({ error: 'Versturen is niet gelukt. Probeer het zo nog eens.' }, { status: 502 });
  }
  return NextResponse.json(result);
}
