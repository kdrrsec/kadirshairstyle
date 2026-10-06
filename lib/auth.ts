import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dagen ingelogd blijven

function sign(value: string) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(password, expected as string);
}

export function createSessionValue() {
  const payload = String(Date.now());
  return `${payload}.${sign(payload)}`;
}

export function isValidSession(cookieValue: string | undefined) {
  if (!cookieValue) return false;
  const [payload, sig] = cookieValue.split('.');
  const expected = payload ? sign(payload) : null;
  if (!payload || !sig || !expected || !safeEqual(sig, expected)) return false;
  return Date.now() - Number(payload) < SESSION_MAX_AGE_SECONDS * 1000;
}
