/**
 * Alle fotografie op één plek.
 *
 * Op dit moment is dit tijdelijke sfeerfotografie (Unsplash). Vervang de `src`
 * door eigen salonfoto's, bijvoorbeeld '/images/hero.jpg' in de map /public/images.
 * next/image optimaliseert lokale en externe afbeeldingen automatisch
 * (AVIF/WebP, juiste formaten per scherm, lazy loading).
 */

export type SiteImage = {
  src: string;
  alt: string;
};

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2000&q=80`;

export const images = {
  hero: {
    src: unsplash('photo-1560066984-138dadb4c035'),
    alt: "Kapper aan het werk in de salon van Kadir's Hairstyle in Zutphen",
  },
  heroDetail: {
    src: unsplash('photo-1524504388940-b1c1722653e1'),
    alt: 'Portret van een vrouw met verzorgd, glanzend haar',
  },
  about: {
    src: unsplash('photo-1522337360788-8b13dee7a37e'),
    alt: 'Haarstylist knipt en stylt het haar van een klant',
  },
  treatments: {
    src: unsplash('photo-1562322140-8baeececf3df'),
    alt: 'Kleurbehandeling in de kapsalon',
  },
  experience: {
    src: unsplash('photo-1521590832167-7bcbfaa6381f'),
    alt: 'Interieur van een moderne kapsalon met spiegels en stoelen',
  },
  cta: {
    src: unsplash('photo-1487412947147-5cebf100ffc2'),
    alt: 'Close-up portret met verzorgd haar',
  },
} satisfies Record<string, SiteImage>;

/** Lookbook — de volgorde bepaalt de plek in de editorial compositie (6 foto's). */
export const looks: (SiteImage & { caption: string })[] = [
  {
    src: unsplash('photo-1517841905240-472988babdf9'),
    alt: 'Vrouw met schouderlange coupe en zachte golf',
    caption: 'Zachte lagen',
  },
  {
    src: unsplash('photo-1503951914875-452162b0f3f1'),
    alt: 'Strak geknipt herenkapsel in de stoel',
    caption: 'Precisie',
  },
  {
    src: unsplash('photo-1529626455594-4ff0802cfb7e'),
    alt: 'Portret van een vrouw met lang, gestyled haar',
    caption: 'Natuurlijke glans',
  },
  {
    src: unsplash('photo-1534528741775-53994a69daeb'),
    alt: 'Close-up portret met verzorgde haarlijn',
    caption: 'Detail',
  },
  {
    src: unsplash('photo-1507003211169-0a1dd7228f2d'),
    alt: 'Man met een verzorgde, klassieke coupe',
    caption: 'Klassiek',
  },
  {
    src: unsplash('photo-1519699047748-de8e457a634e'),
    alt: 'Vrouw met lang haar in een zachte, natuurlijke styling',
    caption: 'Beweging',
  },
];
