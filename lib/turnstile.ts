/**
 * Server-side controle van het Cloudflare Turnstile-vinkje.
 * Staat alleen aan als TURNSTILE_SECRET_KEY is ingesteld.
 */
export function turnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token: unknown, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== 'string' || !token) return false;

  const form = new URLSearchParams({ secret, response: token });
  if (ip && ip !== 'onbekend') form.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!data.success) console.warn('Turnstile geweigerd:', data['error-codes']);
    return Boolean(data.success);
  } catch (err) {
    // Is Cloudflare zelf onbereikbaar, dan boekingen niet blokkeren; de andere spamregels blijven gelden.
    console.error('Turnstile-controle niet bereikbaar:', err);
    return true;
  }
}
