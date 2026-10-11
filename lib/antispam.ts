import crypto from 'crypto';
import { pool } from '@/lib/db';

/** Grenzen tegen misbruik van het online boeken. */
export const LIMITS = {
  attemptsPer10Min: 8, // boekpogingen per IP per 10 minuten
  bookingsPerIpPerDay: 3, // geslaagde boekingen per IP per 24 uur
  upcomingPerPhone: 2, // openstaande afspraken per telefoonnummer
  minFillMs: 3000, // sneller invullen dan dit is vrijwel altijd een bot
};

export function clientIp(request: Request) {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'onbekend'
  );
}

/** IP-adressen worden niet opgeslagen, alleen een onomkeerbare hash ervan. */
export function hashIp(ip: string) {
  const salt = process.env.ADMIN_PASSWORD || 'kadirshairstyle';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex').slice(0, 32);
}

/** Registreert een boekpoging en geeft true terug als dit IP te veel pogingen doet. */
export async function tooManyAttempts(ipHash: string) {
  await pool.query(`DELETE FROM booking_attempts WHERE created_at < now() - interval '1 day'`);
  await pool.query('INSERT INTO booking_attempts (ip_hash) VALUES ($1)', [ipHash]);
  const { rows } = await pool.query(
    `SELECT count(*)::int AS n FROM booking_attempts
     WHERE ip_hash = $1 AND created_at > now() - interval '10 minutes'`,
    [ipHash]
  );
  return rows[0].n > LIMITS.attemptsPer10Min;
}
