import { NextResponse, type NextRequest } from 'next/server';

/**
 * Schakelaar "We gaan binnenkort live".
 *
 * Zet in Vercel COMING_SOON=1 (en redeploy): alle bezoekers zien dan de pagina
 * /binnenkort, op elke pagina van de site. Wie de geheime link
 *   https://<domein>/?voorbeeld=<COMING_SOON_SECRET>
 * opent, krijgt een cookie en ziet gewoon de echte site. Met ?voorbeeld=uit
 * gaat die cookie weer weg. Beheer (/admin), het wachtrijscherm (/scherm),
 * /privacy en de API blijven altijd bereikbaar.
 */

const COOKIE = 'kh_voorbeeld';

function comingSoonOn() {
  const v = (process.env.COMING_SOON ?? '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'aan' || v === 'on';
}

async function token(secret: string) {
  const data = new TextEncoder().encode(`kadirshairstyle-voorbeeld:${secret}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function proxy(request: NextRequest) {
  if (!comingSoonOn()) return NextResponse.next();

  const secret = process.env.COMING_SOON_SECRET;
  const { nextUrl } = request;
  const voorbeeld = nextUrl.searchParams.get('voorbeeld');

  if (voorbeeld !== null) {
    const clean = nextUrl.clone();
    clean.searchParams.delete('voorbeeld');
    const res = NextResponse.redirect(clean);
    if (secret && voorbeeld === secret) {
      res.cookies.set(COOKIE, await token(secret), {
        httpOnly: true,
        secure: nextUrl.protocol === 'https:',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 90,
      });
    } else if (voorbeeld === 'uit') {
      res.cookies.delete(COOKIE);
    }
    return res;
  }

  if (secret && request.cookies.get(COOKIE)?.value === (await token(secret))) {
    return NextResponse.next();
  }

  const res = NextResponse.rewrite(new URL('/binnenkort', request.url));
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next|admin|scherm|binnenkort|privacy|opengraph-image|robots\\.txt|sitemap\\.xml|.*\\..*).*)',
  ],
};
