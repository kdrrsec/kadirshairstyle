import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, isValidSession } from '@/lib/auth';
import { databaseUnavailable } from '@/lib/api';

/** Geeft een foutresponse terug als de beheerder niet is ingelogd of de database ontbreekt. */
export function guardAdmin(request: NextRequest) {
  if (!isValidSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }
  return databaseUnavailable();
}

export function addDays(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days, 12)).toISOString().slice(0, 10);
}
