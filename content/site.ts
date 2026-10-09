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
  instagram: null as { handle: string; url: string } | null,

  /** Bijv. { handle: '@kadirshairstyle', url: 'https://www.tiktok.com/@kadirshairstyle' } */
  tiktok: null as { handle: string; url: string } | null,

  /**
   * Openingstijden. Worden zowel op de website getoond als gebruikt door het
   * reserveringssysteem om beschikbare tijden te berekenen.
   *
   * LET OP: zolang `hoursConfirmed` op false staat, toont de website een
   * placeholder in plaats van deze tijden. De tijden hieronder zijn een
   * tijdelijke standaard voor het reserveringssysteem — pas ze aan naar de
   * echte openingstijden en zet `hoursConfirmed` op true.
   */
  hoursConfirmed: false as boolean,
  hours: {
    ma: null,
    di: { open: '09:00', close: '18:00' },
    wo: { open: '09:00', close: '18:00' },
    do: { open: '09:00', close: '18:00' },
    vr: { open: '09:00', close: '18:00' },
    za: { open: '09:00', close: '17:00' },
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
 * `priceFrom` staat op null zolang prijzen niet bekend zijn; de website
 * toont dan "op aanvraag".
 */
export const treatments = [
  {
    slug: 'knippen',
    tag: 'Knippen',
    name: 'Knippen',
    description: 'Een knipbeurt op maat, helemaal afgestemd op jouw stijl.',
    durationMinutes: 30,
    priceFrom: null as number | null,
  },
  {
    slug: 'wassen-knippen',
    tag: 'Combi',
    name: 'Wassen & knippen',
    description: 'Wassen, verzorgen en knippen in één ontspannen behandeling.',
    durationMinutes: 30,
    priceFrom: null as number | null,
  },
  {
    slug: 'styling-fohnen',
    tag: 'Styling',
    name: 'Styling / föhnen',
    description: 'Föhnen en stylen voor volume, glans en een verzorgde look.',
    durationMinutes: 30,
    priceFrom: null as number | null,
  },
  {
    slug: 'kleuren',
    tag: 'Kleur',
    name: 'Kleuren',
    description: 'Een kleur die bij je past, met persoonlijk advies vooraf.',
    durationMinutes: 30,
    priceFrom: null as number | null,
  },
  {
    slug: 'highlights',
    tag: 'Kleur',
    name: 'Highlights',
    description: 'Licht en diepte op de juiste plekken, natuurlijk of opvallend.',
    durationMinutes: 30,
    priceFrom: null as number | null,
  },
  {
    slug: 'haarverzorging',
    tag: 'Verzorging',
    name: 'Haarverzorging',
    description: 'Verzorgende behandelingen voor gezond, sterk en zacht haar.',
    durationMinutes: 30,
    priceFrom: null as number | null,
  },
];

/**
 * Video's in de sectie "Bekijk ons werk". Plak hier de links van TikTok-video's
 * of Instagram-reels/posts, bijvoorbeeld:
 *   'https://www.tiktok.com/@kadirshairstyle/video/7300000000000000000'
 *   'https://www.instagram.com/reel/C1AbCdEfGhI/'
 * Zolang de lijst leeg is, toont de website nette placeholders.
 */
export const socialVideos: string[] = [];

export function fullAddress() {
  if (!site.address) return null;
  return `${site.address.street}, ${site.address.postalCode} ${site.city}`;
}
