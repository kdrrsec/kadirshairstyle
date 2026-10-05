# Kadir's Hairstyle — Zutphen

One-page website met online reserveren voor Kadir's Hairstyle, kapsalon in Zutphen.
Gebouwd door AxaWeb met Next.js, TypeScript, Tailwind CSS en Framer Motion.

## Structuur

| Pad | Inhoud |
| --- | --- |
| `app/page.tsx` | De one-page website (secties in `components/sections/`) |
| `app/afspraak/` | Reserveren: Dienst → Tijd → Gegevens → Klaar (zelfde flow als In2Hairstyle) |
| `app/admin/` | Afsprakenoverzicht voor de salon (wachtwoord via `ADMIN_PASSWORD`) |
| `app/api/` | Behandelingen, beschikbaarheid, afspraken en beheer (Postgres) |
| `content/site.ts` | **Alle bedrijfsgegevens, behandelingen, openingstijden en reviews** |
| `content/images.ts` | **Alle fotografie op één plek** |

## Nog in te vullen

Alles wat nog niet bekend is staat in `content/site.ts` op `null`. De website toont dan een nette placeholder.

- **Adres**: `site.address`. Zodra dit is ingevuld verschijnen Google Maps, de routelink en het adres in de structured data automatisch.
- **Telefoonnummer**: `site.phone`
- **Instagram**: `site.instagram`
- **Openingstijden**: `site.hours`. Pas de tijden aan en zet `hoursConfirmed` op `true`. Het reserveringssysteem gebruikt deze tijden ook. Tot die tijd draait het op een tijdelijke standaard (di–vr 09:00–18:00, za 09:00–17:00).
- **Behandelingen**: duur (`durationMinutes`) en prijs (`priceFrom`, nu `null` → "Prijs in overleg"). Wijzigingen worden bij de start van de server naar de database gesynchroniseerd.
- **Google Reviews**: echte reviews in `reviews` (maximaal drie zichtbaar) en eventueel `googleReviewsUrl`.
- **Foto's**: in `content/images.ts` staat nu tijdelijke sfeerfotografie van Unsplash. Vervang die door eigen salonfoto's (bijv. `/images/hero.jpg` in `public/images/`).
- **Domein**: zet `NEXT_PUBLIC_SITE_URL` (wordt gebruikt voor canonical, sitemap en Open Graph).

## Lokaal draaien

```bash
cp .env.example .env.local   # vul DATABASE_URL en ADMIN_PASSWORD in
npm install
npm run dev
```

Zonder `DATABASE_URL` werkt de website gewoon. Alleen online reserveren meldt dan dat het tijdelijk niet beschikbaar is.
De databasetabellen worden bij het eerste verzoek automatisch aangemaakt.

## Deployen (Vercel)

1. Koppel de repository aan Vercel.
2. Voeg een Postgres-database toe (bijv. Neon via de Vercel Marketplace) en zet `DATABASE_URL`.
3. Zet `ADMIN_PASSWORD` en `NEXT_PUBLIC_SITE_URL`.
