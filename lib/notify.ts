/**
 * WhatsApp-melding naar de kapper bij een nieuwe afspraak, via CallMeBot (gratis).
 *
 * Instellen: de kapper stuurt vanaf zijn eigen WhatsApp één keer
 * "I allow callmebot to send me messages" naar het CallMeBot-nummer
 * (zie callmebot.com) en krijgt een apikey terug. Zet daarna in Vercel:
 *   CALLMEBOT_PHONE  = zijn nummer met landcode, bijv. +31612345678
 *   CALLMEBOT_APIKEY = de ontvangen apikey
 * Zonder deze variabelen wordt er niets verstuurd.
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

export async function notifyBarber(a: NewAppointment) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return;

  const text = [
    '✂️ *Nieuwe afspraak*',
    `*${a.name}* – ${a.treatment}`,
    `${longDate(a.date)} om ${a.time}`,
    `📞 ${a.phone}`,
  ].join('\n');

  const url = new URL('https://api.callmebot.com/whatsapp.php');
  url.searchParams.set('phone', phone);
  url.searchParams.set('text', text);
  url.searchParams.set('apikey', apikey);

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000), cache: 'no-store' });
    if (!res.ok) console.error('WhatsApp-melding mislukt:', res.status, (await res.text()).slice(0, 200));
  } catch (err) {
    // Een mislukte melding mag een boeking nooit tegenhouden.
    console.error('WhatsApp-melding mislukt:', err);
  }
}
