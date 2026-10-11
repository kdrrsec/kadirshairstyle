import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

/** Soorten nummers waarop een klant echt bereikbaar is (geen 0800/0900, pieper e.d.). */
const ALLOWED_TYPES = new Set(['MOBILE', 'FIXED_LINE', 'FIXED_LINE_OR_MOBILE', 'VOIP', 'PERSONAL_NUMBER']);

export const PHONE_ERROR = 'Vul een geldig telefoonnummer in, bijvoorbeeld je 06-nummer.';

/** Duidelijk verzonnen Nederlandse nummers, zoals 06 12345678 of 06 00000000. */
function looksFake(country: string | undefined, nationalNumber: string) {
  if (country !== 'NL') return false;
  const rest = nationalNumber.slice(-8);
  return /^(\d)\1+$/.test(rest) || ['12345678', '23456789', '87654321', '98765432'].includes(rest);
}

export type PhoneResult =
  | { ok: true; e164: string; display: string }
  | { ok: false; error: string };

/**
 * Controleert een telefoonnummer (standaard Nederlands, buitenlandse nummers met +landcode)
 * en geeft het netjes opgemaakt terug.
 */
export function normalizePhone(input: string): PhoneResult {
  const parsed = parsePhoneNumberFromString(input.trim(), 'NL');
  if (!parsed || !parsed.isValid()) return { ok: false, error: PHONE_ERROR };

  const type = parsed.getType();
  if (type && !ALLOWED_TYPES.has(type)) {
    return { ok: false, error: 'Dit soort nummer kunnen we niet gebruiken. Vul je eigen (mobiele) nummer in.' };
  }
  if (looksFake(parsed.country, parsed.nationalNumber)) return { ok: false, error: PHONE_ERROR };

  return {
    ok: true,
    e164: parsed.number,
    display: parsed.country === 'NL' ? parsed.formatNational() : parsed.formatInternational(),
  };
}
