import { NextResponse } from 'next/server';
import { checkPassword, createSessionValue, ADMIN_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Onjuist wachtwoord' }, { status: 401 });
  }

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
