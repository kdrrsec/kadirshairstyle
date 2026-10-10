import { pool, ensureSchema } from '@/lib/db';
import { dayBoundsUTC, toAmsterdamParts } from '@/lib/schedule';
import { dailyOverviewText, sendWhatsApp } from '@/lib/notify';

/** Stuurt de kapper via WhatsApp alle afspraken van vandaag. */
export async function sendDailyOverview() {
  await ensureSchema();
  const today = toAmsterdamParts(new Date()).date;
  const { start, end } = dayBoundsUTC(today);
  const { rows } = await pool.query(
    `SELECT a.customer_name, a.customer_phone, a.start_time, t.name AS treatment
     FROM appointments a JOIN treatments t ON t.id = a.treatment_id
     WHERE a.status != 'cancelled' AND a.start_time >= $1 AND a.start_time < $2
     ORDER BY a.start_time ASC`,
    [start.toISOString(), end.toISOString()]
  );

  const text = dailyOverviewText(
    today,
    rows.map((r) => ({
      time: toAmsterdamParts(new Date(r.start_time)).time,
      name: r.customer_name,
      treatment: r.treatment,
      phone: r.customer_phone,
    }))
  );
  const sent = await sendWhatsApp(text);
  return { sent, count: rows.length };
}
