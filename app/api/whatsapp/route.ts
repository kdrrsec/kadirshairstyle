import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { databaseUnavailable } from '@/lib/api';
import { handleWhatsAppCommand } from '@/lib/whatsapp-commands';

export const dynamic = 'force-dynamic';

/**
 * Agenda beheren via WhatsApp. AxaWeb Meldingen stuurt berichten van de kapper hierheen
 * (ondertekend met WHATSAPP_WEBHOOK_SECRET) en verstuurt ons antwoord terug via WhatsApp.
 * Alleen berichten van WHATSAPP_PHONE (of de nummers in WHATSAPP_BEHEER_NUMMERS) worden uitgevoerd.
 */

const MAX_AGE_SECONDS = 300;

function digits(n: string) {
  const d = n.replace(/\D/g, '');
  return d.startsWith('00') ? d.slice(2) : d.startsWith('0') ? `31${d.slice(1)}` : d;
}

function validSignature(body: string, timestamp: string | null, signature: string | null) {
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (!secret || !timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > MAX_AGE_SECONDS) return false;
  const expected = `sha256=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`;
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Alleen de hostnaam van de database (geen wachtwoord), om te zien welke database antwoordt. */
function dbHost() {
  try {
    return new URL(process.env.DATABASE_URL || process.env.POSTGRES_URL || '').host;
  } catch {
    return 'onbekend';
  }
}

function allowedNumbers() {
  const list = process.env.WHATSAPP_BEHEER_NUMMERS || process.env.WHATSAPP_PHONE || '';
  return list
    .split(',')
    .map((n) => digits(n))
    .filter(Boolean);
}

export async function POST(request: Request) {
  const body = await request.text();
  if (!validSignature(body, request.headers.get('x-axaweb-timestamp'), request.headers.get('x-axaweb-signature'))) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 });
  }

  let data: { from?: unknown; text?: unknown };
  try {
    data = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 });
  }
  if (typeof data.from !== 'string' || typeof data.text !== 'string') {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 });
  }
  // Alleen de kapper zelf mag de agenda beheren.
  if (!allowedNumbers().includes(digits(data.from))) {
    console.info('WhatsApp-bericht genegeerd: nummer heeft geen toegang');
    return NextResponse.json({ reply: null });
  }

  const unavailable = databaseUnavailable();
  if (unavailable) {
    return NextResponse.json({ reply: '⚠️ De agenda is op dit moment niet bereikbaar. Probeer het later opnieuw.' });
  }

  try {
    const reply = await handleWhatsAppCommand(data.text.slice(0, 1000));
    console.info('WhatsApp-commando', {
      command: data.text.trim().split(/\s+/)[0]?.toUpperCase().slice(0, 20),
      result: (reply || '').split('\n')[0].slice(0, 80),
      db: dbHost(),
      deployment: process.env.VERCEL_DEPLOYMENT_ID || 'lokaal',
    });
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('WhatsApp-commando mislukt:', err);
    return NextResponse.json({ reply: '⚠️ Er ging iets mis bij het verwerken. Probeer het zo nog eens.' });
  }
}
