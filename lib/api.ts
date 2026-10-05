import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/lib/db';

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^\d{2}:\d{2}$/;

/** Geeft een nette fout terug als de database (nog) niet is gekoppeld. */
export function databaseUnavailable() {
  if (isDatabaseConfigured()) return null;
  return NextResponse.json(
    { error: 'Online reserveren is tijdelijk niet beschikbaar. Neem contact op met de salon.' },
    { status: 503 }
  );
}
