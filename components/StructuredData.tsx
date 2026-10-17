import { heroImage } from '@/content/images';
import { site, treatments, type DayKey } from '@/content/site';

const SCHEMA_DAYS: Record<DayKey, string> = {
  ma: 'Monday',
  di: 'Tuesday',
  wo: 'Wednesday',
  do: 'Thursday',
  vr: 'Friday',
  za: 'Saturday',
  zo: 'Sunday',
};

/** Andere schrijfwijzen van de naam, zodat Google ze aan dezelfde zaak koppelt. */
const ALTERNATE_NAMES = ['Kadirshairstyle', 'Kadirs Hairstyle', 'Kadir Hairstyle', "Kadir's Hairstyle Zutphen"];

/** HairSalon / LocalBusiness structured data. Onbekende gegevens worden weggelaten. */
export function StructuredData() {
  // WebSite: bepaalt de sitenaam die Google boven het zoekresultaat toont.
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    name: site.name,
    alternateName: ALTERNATE_NAMES,
    url: site.url,
    inLanguage: 'nl-NL',
    publisher: { '@id': `${site.url}/#salon` },
  };

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': `${site.url}/#salon`,
    name: site.name,
    alternateName: ALTERNATE_NAMES,
    url: site.url,
    image: [`${site.url}${heroImage.src}`],
    logo: `${site.url}/logo.png`,
    slogan: 'Service - Quality - Good vibes',
    description:
      "Herenkapper in Zutphen voor knippen, knippen & baard, baard modelleren en kinderkapsels, met persoonlijke aandacht.",
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.city,
      addressCountry: 'NL',
      ...(site.address && {
        streetAddress: site.address.street,
        postalCode: site.address.postalCode,
      }),
    },
    areaServed: { '@type': 'City', name: site.city },
    potentialAction: {
      '@type': 'ReserveAction',
      target: `${site.url}/afspraak`,
      name: 'Maak afspraak',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Behandelingen',
      itemListElement: treatments.map((t) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: t.name, description: t.description },
        ...(t.priceFrom !== null && { price: t.priceFrom.toFixed(2), priceCurrency: 'EUR' }),
      })),
    },
  };

  if (site.phone) data.telephone = site.phone.href;
  const profiles = [site.instagram?.url, site.tiktok?.url].filter(Boolean);
  if (profiles.length) data.sameAs = profiles;
  if (site.hoursConfirmed) {
    data.openingHoursSpecification = (Object.keys(site.hours) as DayKey[])
      .filter((d) => site.hours[d])
      .map((d) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${SCHEMA_DAYS[d]}`,
        opens: site.hours[d]!.open,
        closes: site.hours[d]!.close,
      }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify([website, data]).replace(/</g, '\\u003c') }}
    />
  );
}
