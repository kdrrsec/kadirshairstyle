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

/** HairSalon / LocalBusiness structured data. Onbekende gegevens worden weggelaten. */
export function StructuredData() {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': `${site.url}/#salon`,
    name: site.name,
    url: site.url,
    image: [`${site.url}${heroImage.src}`],
    logo: `${site.url}/logo.png`,
    slogan: 'Service - Quality - Good vibes',
    description:
      "Moderne kapsalon in Zutphen voor knippen, kleuren, highlights, styling en haarverzorging, met persoonlijke aandacht.",
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
      })),
    },
  };

  if (site.phone) data.telephone = site.phone.href;
  if (site.instagram) data.sameAs = [site.instagram.url];
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
