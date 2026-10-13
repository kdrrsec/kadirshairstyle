/**
 * Voert de WhatsApp-commando's van de kapper uit op de agenda (zie lib/whatsapp-parse.ts
 * voor de berichten die hij kan sturen). Geeft de tekst terug die via WhatsApp terug gaat.
 */
import { pool, ensureSchema } from '@/lib/db';
import { treatments as siteTreatments } from '@/content/site';
import { computeAvailableSlots, dayBoundsUTC, hoursForDate, localToUTC, toAmsterdamParts } from '@/lib/schedule';
import { normalizePhone } from '@/lib/phone';
import { HELP_TEXT, addDaysISO, parseCommand, type Command, type TreatmentRef } from '@/lib/whatsapp-parse';

const MAX_BLOCK_DAYS = 62;

type DbTreatment = TreatmentRef & { id: number; duration: number };

function longDate(date: string) {
  const s = new Intl.DateTimeFormat('nl-NL', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(`${date}T12:00:00Z`)
  );
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const hm = (d: Date) => toAmsterdamParts(d).time;

async function loadTreatments(): Promise<DbTreatment[]> {
  const { rows } = await pool.query(
    'SELECT id, slug, name, duration_minutes FROM treatments WHERE active ORDER BY sort_order'
  );
  return rows.map((r) => {
    const site = siteTreatments.find((t) => t.slug === r.slug) as
      | { tag?: string; aliases?: readonly string[] }
      | undefined;
    return { id: r.id, slug: r.slug, name: r.name, duration: r.duration_minutes, tag: site?.tag, aliases: site?.aliases };
  });
}

/** Verwerkt één WhatsApp-bericht van de kapper. `null` = geen antwoord sturen. */
export async function handleWhatsAppCommand(text: string, now = new Date()): Promise<string | null> {
  await ensureSchema();
  const treatments = await loadTreatments();
  const today = toAmsterdamParts(now).date;
  const cmd = parseCommand(text, today, treatments);

  switch (cmd.kind) {
    case 'none':
      return null;
    case 'error':
      return `⚠️ ${cmd.message}`;
    case 'help':
      return HELP_TEXT;
    case 'agenda':
      return agenda(cmd.date);
    case 'book':
      return book(cmd, treatments, now);
    case 'block':
      return block(cmd);
    case 'unblock':
      return unblock(cmd);
    case 'cancel':
      return cancel(cmd.id);
  }
}

async function agenda(date: string) {
  const { start, end } = dayBoundsUTC(date);
  const [{ rows: appts }, { rows: blocks }] = await Promise.all([
    pool.query(
      `SELECT a.id, a.customer_name, a.customer_phone, a.start_time, a.end_time, t.name AS treatment
       FROM appointments a JOIN treatments t ON t.id = a.treatment_id
       WHERE a.status != 'cancelled' AND a.start_time >= $1 AND a.start_time < $2
       ORDER BY a.start_time`,
      [start.toISOString(), end.toISOString()]
    ),
    pool.query(
      `SELECT start_time, end_time, reason FROM blocked_slots
       WHERE start_time < $2 AND end_time > $1 ORDER BY start_time`,
      [start.toISOString(), end.toISOString()]
    ),
  ]);

  const hours = hoursForDate(date);
  const lines = [`📅 *${longDate(date)}*${hours ? ` (${hours.open}–${hours.close})` : ' (gesloten)'}`];
  for (const b of blocks) {
    const whole = new Date(b.start_time) <= start && new Date(b.end_time) >= end;
    lines.push(`⛔ ${whole ? 'Hele dag geblokkeerd' : `${hm(b.start_time)}–${hm(b.end_time)} geblokkeerd`}${b.reason ? ` (${b.reason})` : ''}`);
  }
  if (appts.length === 0) lines.push('Geen afspraken.');
  for (const a of appts) {
    lines.push(`*${hm(a.start_time)}* ${a.customer_name} – ${a.treatment}${a.customer_phone ? ` (${a.customer_phone})` : ''}  #${a.id}`);
  }
  return lines.join('\n');
}

async function book(cmd: Extract<Command, { kind: 'book' }>, treatments: DbTreatment[], now: Date) {
  const treatment = treatments.find((t) => t.slug === cmd.treatment)!;
  const start = localToUTC(cmd.date, cmd.time);
  const end = new Date(start.getTime() + treatment.duration * 60000);
  if (start.getTime() < now.getTime() - 60 * 60000) {
    return `⚠️ ${longDate(cmd.date)} om ${cmd.time} is al voorbij.`;
  }

  let phone = '';
  let phoneE164: string | null = null;
  if (cmd.phone) {
    const p = normalizePhone(cmd.phone);
    if (!p.ok) return `⚠️ Het telefoonnummer ${cmd.phone} klopt niet. Laat het weg of verbeter het.`;
    phone = p.display;
    phoneE164 = p.e164;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE appointments IN SHARE ROW EXCLUSIVE MODE');
    const { rows: conflicts } = await client.query(
      `SELECT 'afspraak' AS kind, a.customer_name AS label, a.start_time, a.end_time FROM appointments a
       WHERE a.status != 'cancelled' AND a.start_time < $2 AND a.end_time > $1
       UNION ALL
       SELECT 'blok', reason, start_time, end_time FROM blocked_slots WHERE start_time < $2 AND end_time > $1`,
      [start.toISOString(), end.toISOString()]
    );
    if (conflicts.length > 0) {
      await client.query('ROLLBACK');
      const c = conflicts[0];
      const why =
        c.kind === 'blok'
          ? `die tijd is geblokkeerd${c.label ? ` (${c.label})` : ''}. Stuur eerst *VRIJ ${cmd.date.slice(8)}-${cmd.date.slice(5, 7)}* als je hem toch wilt inplannen`
          : `daar staat al ${c.label} (${hm(c.start_time)}–${hm(c.end_time)})`;
      const free = await freeTimesNear(cmd.date, cmd.time, treatment.duration, now);
      return `❌ ${cmd.time} op ${longDate(cmd.date).toLowerCase()} kan niet: ${why}.${
        free.length ? `\n\nWel vrij: ${free.join(', ')}` : '\n\nDie dag is verder vol.'
      }`;
    }

    const { rows } = await client.query(
      `INSERT INTO appointments (treatment_id, customer_name, customer_phone, customer_email, start_time, end_time, phone_e164)
       VALUES ($1,$2,$3,NULL,$4,$5,$6) RETURNING id`,
      [treatment.id, cmd.name, phone, start.toISOString(), end.toISOString(), phoneE164]
    );
    await client.query('COMMIT');

    const hours = hoursForDate(cmd.date);
    const outside = !hours || cmd.time < hours.open || hm(end) > hours.close;
    return [
      `✅ *Ingepland* #${rows[0].id}`,
      `${cmd.name} – ${treatment.name}`,
      `${longDate(cmd.date)} ${cmd.time}–${hm(end)}`,
      phone ? `📞 ${phone}` : '',
      outside ? '_Let op: dit valt buiten de openingstijden._' : '',
      `Annuleren: *ANNULEER ${rows[0].id}*`,
    ]
      .filter(Boolean)
      .join('\n');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Vrije tijden op die dag, het dichtst bij de gevraagde tijd. */
async function freeTimesNear(date: string, time: string, duration: number, now: Date) {
  const { start, end } = dayBoundsUTC(date);
  const { rows: busy } = await pool.query(
    `SELECT start_time, end_time FROM appointments WHERE status != 'cancelled' AND start_time < $2 AND end_time > $1
     UNION ALL
     SELECT start_time, end_time FROM blocked_slots WHERE start_time < $2 AND end_time > $1`,
    [start.toISOString(), end.toISOString()]
  );
  const slots = computeAvailableSlots(
    date,
    duration,
    busy.map((r) => ({ start: new Date(r.start_time), end: new Date(r.end_time) })),
    now
  );
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  return slots
    .sort((a, b) => Math.abs(toMin(a) - toMin(time)) - Math.abs(toMin(b) - toMin(time)))
    .slice(0, 4)
    .sort();
}

function daysBetween(from: string, to: string) {
  const days: string[] = [];
  for (let d = from; d <= to && days.length <= MAX_BLOCK_DAYS; d = addDaysISO(d, 1)) days.push(d);
  return days;
}

async function block(cmd: Extract<Command, { kind: 'block' }>) {
  const days = daysBetween(cmd.from, cmd.to);
  if (days.length > MAX_BLOCK_DAYS) return `⚠️ Maximaal ${MAX_BLOCK_DAYS} dagen tegelijk blokkeren.`;

  const ranges = days.map((d) =>
    cmd.startTime && cmd.endTime
      ? { start: localToUTC(d, cmd.startTime), end: localToUTC(d, cmd.endTime) }
      : dayBoundsUTC(d)
  );
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const r of ranges) {
      await client.query('INSERT INTO blocked_slots (start_time, end_time, reason) VALUES ($1,$2,$3)', [
        r.start.toISOString(),
        r.end.toISOString(),
        cmd.reason || null,
      ]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  // Bestaande afspraken in die periode melden (die blijven staan).
  const { rows: existing } = await pool.query(
    `SELECT a.id, a.customer_name, a.customer_phone, a.start_time FROM appointments a
     WHERE a.status != 'cancelled' AND a.start_time < $2 AND a.end_time > $1 ORDER BY a.start_time`,
    [ranges[0].start.toISOString(), ranges[ranges.length - 1].end.toISOString()]
  );
  const inBlock = existing.filter((a) =>
    ranges.some((r) => new Date(a.start_time) >= r.start && new Date(a.start_time) < r.end)
  );

  const when =
    days.length === 1
      ? `${longDate(cmd.from)}${cmd.startTime ? ` ${cmd.startTime}–${cmd.endTime}` : ' (hele dag)'}`
      : `${longDate(cmd.from)} t/m ${longDate(cmd.to).toLowerCase()}${cmd.startTime ? `, elke dag ${cmd.startTime}–${cmd.endTime}` : ''}`;
  const lines = [`⛔ *Geblokkeerd:* ${when}`, 'Online boeken kan dan niet meer.'];
  if (inBlock.length) {
    lines.push('', `Let op, er staan nog ${inBlock.length} ${inBlock.length === 1 ? 'afspraak' : 'afspraken'}:`);
    for (const a of inBlock.slice(0, 10)) {
      const p = toAmsterdamParts(new Date(a.start_time));
      lines.push(`#${a.id} ${p.date.slice(8)}-${p.date.slice(5, 7)} ${p.time} ${a.customer_name}${a.customer_phone ? ` (${a.customer_phone})` : ''}`);
    }
    lines.push('Annuleren met *ANNULEER <nr>* (en laat de klant het even weten).');
  }
  const dm = (d: string) => `${d.slice(8)}-${d.slice(5, 7)}`;
  lines.push('', `Weer openzetten: *VRIJ ${dm(cmd.from)}${days.length > 1 ? ` t/m ${dm(cmd.to)}` : ''}*`);
  return lines.join('\n');
}

async function unblock(cmd: Extract<Command, { kind: 'unblock' }>) {
  const start = dayBoundsUTC(cmd.from).start;
  const end = dayBoundsUTC(cmd.to).end;
  const { rowCount } = await pool.query('DELETE FROM blocked_slots WHERE start_time < $2 AND end_time > $1', [
    start.toISOString(),
    end.toISOString(),
  ]);
  const when = cmd.from === cmd.to ? longDate(cmd.from) : `${longDate(cmd.from)} t/m ${longDate(cmd.to).toLowerCase()}`;
  return rowCount ? `✅ *Weer open:* ${when}\nOnline boeken kan weer.` : `Er was niets geblokkeerd op ${when.toLowerCase()}.`;
}

async function cancel(id: number) {
  const { rows } = await pool.query(
    `UPDATE appointments a SET status = 'cancelled' FROM treatments t
     WHERE a.id = $1 AND a.status != 'cancelled' AND t.id = a.treatment_id
     RETURNING a.customer_name, a.customer_phone, a.start_time, t.name AS treatment`,
    [id]
  );
  if (rows.length === 0) return `⚠️ Afspraak #${id} niet gevonden (of al geannuleerd).`;
  const a = rows[0];
  const p = toAmsterdamParts(new Date(a.start_time));
  return [
    `🗑️ *Geannuleerd* #${id}`,
    `${a.customer_name} – ${a.treatment}`,
    `${longDate(p.date)} ${p.time}`,
    a.customer_phone ? `Laat de klant het even weten: ${a.customer_phone}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
