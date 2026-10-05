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
  address: null as { street: string; postalCode: string } | null,

  /** Bijv. { display: '0575 123 456', href: '+31575123456' } */
  phone: null as { display: string; href: string } | null,

  /** Bijv. { handle: '@kadirshairstyle', url: 'https://www.instagram.com/kadirshairstyle/' } */
  instagram: null as { handle: string; url: string } | null,

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
  { label: 'Home', href: '/#top' },
  { label: 'Over ons', href: '/#over-ons' },
  { label: 'Behandelingen', href: '/#behandelingen' },
  { label: 'Onze looks', href: '/#looks' },
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
 * toont dan "Prijs in overleg".
 */
export const treatments = [
  {
    slug: 'knippen',
    name: 'Knippen',
    description: 'Een coupe die past bij je gezicht, je haar en je dagelijkse routine.',
    durationMinutes: 30,
    priceFrom: null as number | null,
  },
  {
    slug: 'wassen-knippen',
    name: 'Wassen & knippen',
    description: 'Ontspannen wassen, verzorgen en knippen — van begin tot eind in rust.',
    durationMinutes: 45,
    priceFrom: null as number | null,
  },
  {
    slug: 'styling-fohnen',
    name: 'Styling / föhnen',
    description: 'Volume, glans en vorm. Voor elke dag, of voor dat ene moment.',
    durationMinutes: 30,
    priceFrom: null as number | null,
  },
  {
    slug: 'kleuren',
    name: 'Kleuren',
    description: 'Een kleur die je huid laat stralen, afgestemd in een persoonlijk advies.',
    durationMinutes: 90,
    priceFrom: null as number | null,
  },
  {
    slug: 'highlights',
    name: 'Highlights',
    description: 'Licht en diepte op precies de juiste plekken, natuurlijk of uitgesproken.',
    durationMinutes: 120,
    priceFrom: null as number | null,
  },
  {
    slug: 'haarverzorging',
    name: 'Haarverzorging',
    description: 'Intensieve behandelingen voor gezond, sterk en zacht haar.',
    durationMinutes: 30,
    priceFrom: null as number | null,
  },
];

/**
 * Google Reviews. Plaats hier echte reviews (maximaal drie worden getoond).
 * Zolang deze lijst leeg is, toont de website placeholders.
 */
export const reviews: { text: string; author: string; rating: number }[] = [];

/** Link naar de Google-reviewpagina van de salon (bijv. via Google Bedrijfsprofiel). */
export const googleReviewsUrl: string | null = null;

export function fullAddress() {
  if (!site.address) return null;
  return `${site.address.street}, ${site.address.postalCode} ${site.city}`;
}
