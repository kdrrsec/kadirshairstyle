/**
 * Centrale content en bedrijfsgegevens van Kadir's Hairstyle.
 *
 * Alles wat nog niet bekend is staat hier op `null`. De website toont dan
 * automatisch een nette, herkenbare placeholder. Vul de waarde in en de
 * website (inclusief Google Maps, structured data en het reserveringssysteem)
 * werkt het overal bij.
 */

export type DayKey = 'ma' | 'di' | 'wo' | 'do' | 'vr' | 'za' | 'zo';

export type OpeningHours = Record<DayKey, { open: string; close: string } | null>;

export const site = {
  name: "Kadir's Hairstyle",
  city: 'Zutphen',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kadirshairstyle.nl',

  /** Bijv. { street: 'Voorbeeldstraat 1', postalCode: '7201 AA' } */
  address: { street: 'Troelstralaan 35', postalCode: '7204 LC' } as { street: string; postalCode: string } | null,

  /** Bijv. { display: '0575 123 456', href: '+31575123456' } */
  phone: null as { display: string; href: string } | null,

  /** Bijv. { handle: '@kadirshairstyle', url: 'https://www.instagram.com/kadirshairstyle/' } */
  instagram: { handle: '@kadirshairstyle', url: 'https://www.instagram.com/kadirshairstyle/' } as { handle: string; url: string } | null,

  /** Bijv. { handle: '@kadirshairstyle', url: 'https://www.tiktok.com/@kadirshairstyle' } */
  tiktok: { handle: '@kadirshairstyle', url: 'https://www.tiktok.com/@kadirshairstyle' } as { handle: string; url: string } | null,

  /**
   * Openingstijden. Worden zowel op de website getoond als gebruikt door het
   * reserveringssysteem om beschikbare tijden te berekenen.
   *
   * LET OP: zolang `hoursConfirmed` op false staat, toont de website een
   * placeholder in plaats van deze tijden. De tijden hieronder zijn een
   * tijdelijke standaard voor het reserveringssysteem — pas ze aan naar de
   * echte openingstijden en zet `hoursConfirmed` op true.
   */
  hoursConfirmed: true as boolean,
  hours: {
    ma: { open: '11:00', close: '16:00' },
    di: { open: '10:00', close: '18:00' },
    wo: { open: '10:00', close: '18:00' },
    do: { open: '10:00', close: '18:00' },
    vr: { open: '10:00', close: '20:00' },
    za: { open: '10:00', close: '17:00' },
    zo: null,
  } as OpeningHours,
};

export const dayLabels: Record<DayKey, string> = {
  ma: 'Maandag',
  di: 'Dinsdag',
  wo: 'Woensdag',
  do: 'Donderdag',
  vr: 'Vrijdag',
  za: 'Zaterdag',
  zo: 'Zondag',
};

export const navItems = [
  { label: 'Over ons', href: '/#over-ons' },
  { label: 'Diensten', href: '/#diensten' },
  { label: 'Contact', href: '/#contact' },
] as const;

export const BOOKING_HREF = '/afspraak';

/**
 * Behandelingen. Dit is ook de bron voor het reserveringssysteem: bij de
 * eerste start worden ze in de database gezet.
 *
 * `durationMinutes` bepaalt hoe lang een tijdslot in de agenda wordt
 * vastgehouden — stem dit af met de salon.
 * `priceFrom` is de prijs in euro's (null = "op aanvraag").
 * `aliases` zijn extra woorden waarmee de kapper de dienst via WhatsApp kan noemen
 * (bijv. "AFSPRAAK morgen 11:00 Jan knip baard").
 * Diensten die hier worden weggehaald, worden in de database op inactief gezet
 * (oude afspraken blijven zo zichtbaar in het beheer).
 */
export const treatments = [
  {
    slug: 'knippen',
    tag: 'Knippen',
    name: 'Knippen',
    description: 'Een strakke knipbeurt op maat, helemaal afgestemd op jouw stijl.',
    durationMinutes: 30,
    priceFrom: 25 as number | null,
  },
  {
    slug: 'knippen-baard',
    tag: 'Combi',
    name: 'Knippen & baard',
    aliases: ['knippen baard', 'knip baard', 'knippen + baard', 'knippen en baard'],
    description: 'Knippen en je baard in model, samen in één afspraak.',
    durationMinutes: 30,
    priceFrom: 30 as number | null,
  },
  {
    slug: 'kinderen',
    tag: 'Kids',
    name: 'Kinderen t/m 12 jaar',
    aliases: ['kind', 'kinder', 'kinderknippen', 'jongen'],
    description: 'Een frisse coupe voor de jonge heren, tot en met 12 jaar.',
    durationMinutes: 30,
    priceFrom: 20 as number | null,
  },
  {
    slug: 'baard-modelleren',
    tag: 'Baard',
    name: 'Baard modelleren',
    aliases: ['baard', 'baard trimmen', 'trimmen'],
    description: 'Je baard strak in model, met scherpe lijnen en de juiste lengte.',
    durationMinutes: 30,
    priceFrom: 15 as number | null,
  },
];

/**
 * Video's in de sectie "Bekijk ons werk". Plak hier de links van TikTok-video's
 * of Instagram-reels/posts, bijvoorbeeld:
 *   'https://www.tiktok.com/@kadirshairstyle/video/7300000000000000000'
 *   'https://www.instagram.com/reel/C1AbCdEfGhI/'
 * Eigen videobestanden kan ook: zet ze in public/videos/ en gebruik bijv.
 *   '/videos/fade.mp4'  (een '/videos/fade.jpg' wordt dan als stilstaand beeld gebruikt)
 * Die spelen vanzelf en zonder geluid af, zonder naam, likes of logo.
 * Zolang de lijst leeg is, toont de website nette placeholders.
 */
export const socialVideos: string[] = [
  '/videos/werk-1.mp4',
  '/videos/werk-2.mp4',
  '/videos/werk-3.mp4',
  '/videos/werk-4.mp4',
];

export function fullAddress() {
  if (!site.address) return null;
  return `${site.address.street}, ${site.address.postalCode} ${site.city}`;
}
