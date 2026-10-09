import crypto from 'crypto';

/** Controleert de geheime code voor het TV-scherm (SCREEN_TOKEN). */
export function isValidScreenCode(code: string | null) {
  const expected = process.env.SCREEN_TOKEN;
  if (!expected || !code) return false;
  const a = Buffer.from(code);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Alleen de voornaam, netjes met hoofdletter, voor weergave op het scherm. */
export function firstName(fullName: string) {
  const first = fullName.trim().split(/\s+/)[0] || '';
  return first.charAt(0).toLocaleUpperCase('nl-NL') + first.slice(1);
}
