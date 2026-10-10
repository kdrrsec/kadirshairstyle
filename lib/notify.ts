/**
 * WhatsApp-berichten naar de kapper: een melding bij elke nieuwe afspraak en
 * elke ochtend het overzicht van de dag.
 *
 * Verstuurd via AxaWeb Meldingen (https://meldingen.axaweb.nl). Instellen:
 * de kapper stuurt vanaf zijn eigen WhatsApp één keer "START <naam>" naar het
 * AxaWeb-afzendnummer en krijgt een apikey terug. Zet daarna in Vercel:
 *   WHATSAPP_PHONE  = zijn nummer met landcode, bijv. 31612345678
 *   WHATSAPP_APIKEY = de ontvangen apikey
 * (Oude CallMeBot-instellingen CALLMEBOT_PHONE/CALLMEBOT_APIKEY werken nog als
 * WHATSAPP_APIKEY leeg is.) Zonder deze variabelen wordt er niets verstuurd.
 *
 * Het dagoverzicht draait als Vercel Cron (zie vercel.json) op /api/cron/dagoverzicht.
 */

const AXAWEB_URL = process.env.WHATSAPP_API_URL || 'https://meldingen.axaweb.nl/send';

type NewAppointment = {
  name: string;
  phone: string;
  treatment: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
};

function longDate(date: string) {
  const s = new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${date}T12:00:00Z`));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Is er een WhatsApp-dienst ingesteld (AxaWeb Meldingen of CallMeBot)? */
export function whatsappConfigured() {
  return Boolean(
    (process.env.WHATSAPP_PHONE && process.env.WHATSAPP_APIKEY) ||
      (process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_APIKEY)
  );
}

function buildRequest(text: string): [URL | string, RequestInit] | null {
  const phone = process.env.WHATSAPP_PHONE;
  const apikey = process.env.WHATSAPP_APIKEY;
  if (phone && apikey) {
    return [
      AXAWEB_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, text, key: apikey }),
      },
    ];
  }

  // Terugval: CallMeBot
  const cmbPhone = process.env.CALLMEBOT_PHONE;
  const cmbKey = process.env.CALLMEBOT_APIKEY;
  if (!cmbPhone || !cmbKey) return null;
  const url = new URL('https://api.callmebot.com/whatsapp.php');
  url.searchParams.set('phone', cmbPhone);
  url.searchParams.set('text', text);
  url.searchParams.set('apikey', cmbKey);
  return [url, {}];
}

/** Stuurt een WhatsApp-bericht naar de kapper. Doet niets als WhatsApp niet is ingesteld. */
export async function sendWhatsApp(text: string) {
  const request = buildRequest(text);
  if (!request) return false;
  const [url, init] = request;

  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(15000), cache: 'no-store' });
    if (!res.ok) {
      console.error('WhatsApp-bericht mislukt:', res.status, (await res.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (err) {
    // Een mislukt bericht mag een boeking nooit tegenhouden.
    console.error('WhatsApp-bericht mislukt:', err);
    return false;
  }
}

export function notifyBarber(a: NewAppointment) {
  return sendWhatsApp(
    [
      '✂️ *Nieuwe afspraak*',
      `*${a.name}* – ${a.treatment}`,
      `${longDate(a.date)} om ${a.time}`,
      `📞 ${a.phone}`,
    ].join('\n')
  );
}

type DayAppointment = { time: string; name: string; treatment: string; phone: string };

export function dailyOverviewText(date: string, items: DayAppointment[]) {
  if (items.length === 0) return `☀️ *Goedemorgen!* ${longDate(date)}\nVoor vandaag staan er (nog) geen afspraken.`;
  return [
    `☀️ *Goedemorgen!* ${longDate(date)}`,
    `Je hebt vandaag *${items.length}* ${items.length === 1 ? 'afspraak' : 'afspraken'}:`,
    '',
    ...items.map((a) => `*${a.time}* ${a.name} – ${a.treatment} (${a.phone})`),
  ].join('\n');
}
