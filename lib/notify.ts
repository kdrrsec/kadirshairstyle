/**
 * WhatsApp-berichten naar de kapper via CallMeBot (gratis): een melding bij
 * elke nieuwe afspraak en elke ochtend het overzicht van de dag.
 *
 * Instellen: de kapper stuurt vanaf zijn eigen WhatsApp één keer
 * "I allow callmebot to send me messages" naar het CallMeBot-nummer
 * (zie callmebot.com) en krijgt een apikey terug. Zet daarna in Vercel:
 *   CALLMEBOT_PHONE  = zijn nummer met landcode, bijv. +31612345678
 *   CALLMEBOT_APIKEY = de ontvangen apikey
 * Zonder deze variabelen wordt er niets verstuurd.
 *
 * Het dagoverzicht draait als Vercel Cron (zie vercel.json) op /api/cron/dagoverzicht.
 */

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

/** Stuurt een WhatsApp-bericht naar de kapper. Doet niets als CallMeBot niet is ingesteld. */
export async function sendWhatsApp(text: string) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return false;

  const url = new URL('https://api.callmebot.com/whatsapp.php');
  url.searchParams.set('phone', phone);
  url.searchParams.set('text', text);
  url.searchParams.set('apikey', apikey);

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000), cache: 'no-store' });
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
