import { NextResponse, type NextRequest } from 'next/server';

/**
 * Oude adressen → echte domein.
 * kadirshairstyle.axaweb.nl en de vaste vercel.app-adressen sturen bezoekers
 * door naar https://www.kadirshairstyle.nl (zelfde pad). De API wordt nooit
 * doorgestuurd, zodat de WhatsApp-koppeling en de cron altijd blijven werken.
 */

const CANONICAL_HOST = 'www.kadirshairstyle.nl';
const OLD_HOSTS = new Set([
  'kadirshairstyle.axaweb.nl',
  'kadirshairstyle.vercel.app',
  'kadirshairstyle-axaweb.vercel.app',
]);

export function proxy(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').toLowerCase();
  if (OLD_HOSTS.has(host)) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(new URL(`${pathname}${search}`, `https://${CANONICAL_HOST}`), 308);
  }
  return NextResponse.next();
}

export const config = {
  // Nooit voor de API, Next-bestanden en losse bestanden (afbeeldingen, video's, iconen).
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
