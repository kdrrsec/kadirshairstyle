import { NextResponse } from 'next/server';
import { checkPassword, createSessionValue, ADMIN_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/auth';

// Eenvoudige bescherming tegen raden: na 5 foute pogingen 10 minuten geblokkeerd (per IP, per server-instantie).
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const entry = attempts.get(ip);
  if (entry && entry.until > Date.now()) {
    return NextResponse.json(
      { error: 'Te veel pogingen. Probeer het over een paar minuten opnieuw.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Er is nog geen beheerwachtwoord ingesteld.' }, { status: 503 });
  }

  if (!checkPassword(password)) {
    const count = (entry && entry.until <= Date.now() && entry.count >= MAX_ATTEMPTS ? 0 : entry?.count ?? 0) + 1;
    attempts.set(ip, { count, until: count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0 });
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: 'Onjuist wachtwoord.' }, { status: 401 });
  }

  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
