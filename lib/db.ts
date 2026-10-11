import { Pool } from 'pg';
import { treatments } from '@/content/site';

const globalForPg = globalThis as unknown as { _pgPool?: Pool };

/** Vercel/Neon zet DATABASE_URL; POSTGRES_URL wordt als terugval ondersteund. */
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export function isDatabaseConfigured() {
  return Boolean(connectionString);
}

export const pool = globalForPg._pgPool || new Pool({ connectionString, max: 5 });

if (process.env.NODE_ENV !== 'production') {
  globalForPg._pgPool = pool;
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS treatments (
          id SERIAL PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          duration_minutes INT NOT NULL,
          price_from NUMERIC(6,2),
          sort_order INT NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS appointments (
          id SERIAL PRIMARY KEY,
          treatment_id INT NOT NULL REFERENCES treatments(id),
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          customer_email TEXT,
          start_time TIMESTAMPTZ NOT NULL,
          end_time TIMESTAMPTZ NOT NULL,
          status TEXT NOT NULL DEFAULT 'confirmed',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS blocked_slots (
          id SERIAL PRIMARY KEY,
          start_time TIMESTAMPTZ NOT NULL,
          end_time TIMESTAMPTZ NOT NULL,
          reason TEXT
        );

        -- Anti-spam: genormaliseerd nummer en IP-hash per afspraak, en losse boekpogingen.
        ALTER TABLE appointments ADD COLUMN IF NOT EXISTS phone_e164 TEXT;
        ALTER TABLE appointments ADD COLUMN IF NOT EXISTS ip_hash TEXT;
        CREATE INDEX IF NOT EXISTS appointments_phone_e164_idx ON appointments (phone_e164);
        CREATE INDEX IF NOT EXISTS appointments_ip_hash_idx ON appointments (ip_hash, created_at);

        CREATE TABLE IF NOT EXISTS booking_attempts (
          id SERIAL PRIMARY KEY,
          ip_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS booking_attempts_ip_idx ON booking_attempts (ip_hash, created_at);
      `);

      // Behandelingen uit content/site.ts synchroniseren (naam, duur, prijs, volgorde).
      for (const [i, t] of treatments.entries()) {
        await pool.query(
          `INSERT INTO treatments (slug, name, duration_minutes, price_from, sort_order)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (slug) DO UPDATE SET
             name = EXCLUDED.name,
             duration_minutes = EXCLUDED.duration_minutes,
             price_from = EXCLUDED.price_from,
             sort_order = EXCLUDED.sort_order`,
          [t.slug, t.name, t.durationMinutes, t.priceFrom, i + 1]
        );
      }
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}
