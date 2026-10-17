import { pool, ensureSchema } from '@/lib/db';

/** Bewaartermijn van afspraken (AVG): daarna worden ze automatisch gewist. */
export const RETENTION = '6 months';

/**
 * Wist afspraken en geblokkeerde tijden die langer dan de bewaartermijn geleden zijn,
 * en haalt de IP-hash (alleen nodig voor de spamcontrole) na 1 dag weg.
 */
export async function purgeOldData() {
  await ensureSchema();
  const appointments = await pool.query(`DELETE FROM appointments WHERE end_time < now() - $1::interval`, [RETENTION]);
  await pool.query(`DELETE FROM blocked_slots WHERE end_time < now() - $1::interval`, [RETENTION]);
  await pool.query(`UPDATE appointments SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND created_at < now() - interval '1 day'`);
  await pool.query(`DELETE FROM booking_attempts WHERE created_at < now() - interval '1 day'`);
  await pool.query(`DELETE FROM activity_log WHERE created_at < now() - $1::interval`, [RETENTION]);
  return { deletedAppointments: appointments.rowCount ?? 0 };
}
