# Kadir's Hairstyle — Zutphen

One-page website met online reserveren voor Kadir's Hairstyle, kapsalon in Zutphen.
Gebouwd door AxaWeb met Next.js en TypeScript, in dezelfde opzet als de In2Hairstyle-website.

## Structuur

| Pad | Inhoud |
| --- | --- |
| `app/page.tsx` | De one-page website (zelfde opbouw als In2Hairstyle: hero, over ons, diensten + prijslijst, contact) |
| `app/afspraak/` | Reserveren: Dienst → Tijd → Gegevens → Klaar (zelfde flow als In2Hairstyle) |
| `app/admin/` | Beheer voor de kapper: inloggen, afspraken per dag bekijken, verzetten en verwijderen |
| `app/api/` | Behandelingen, beschikbaarheid, afspraken en beheer (Postgres) |
| `content/site.ts` | **Alle bedrijfsgegevens, behandelingen en openingstijden** |
| `content/images.ts` | **Hero-foto** |

## Nog in te vullen

Alles wat nog niet bekend is staat in `content/site.ts` op `null`. De website toont dan een nette placeholder.

- **Adres**: ingevuld (Troelstralaan 35, 7204 LC Zutphen). Google Maps en de routeknop gebruiken dit automatisch.
- **Telefoonnummer**: `site.phone`
- **Instagram / TikTok**: `site.instagram` en `site.tiktok` (profiellinks)
- **Video's**: plak links van TikTok-video's of Instagram-reels in `socialVideos` (in `content/site.ts`); ze verschijnen in de sectie "Bekijk ons werk"
- **Openingstijden**: `site.hours`. Pas de tijden aan en zet `hoursConfirmed` op `true`. Het reserveringssysteem gebruikt deze tijden ook. Tot die tijd draait het op een tijdelijke standaard (di–vr 09:00–18:00, za 09:00–17:00).
- **Behandelingen**: elke behandeling duurt 30 minuten (`durationMinutes`; tijdsloten per half uur). Prijs (`priceFrom`, nu `null` → "op aanvraag"). Wijzigingen worden bij de start van de server naar de database gesynchroniseerd.
- **Logo**: `public/logo.png` (donker) en `public/logo-light.png` (licht), transparant. De favicon (`app/icon.png`) is de schaar uit het logo.
- **Hero-foto**: `public/hero-kadirshairstyle.jpg` (eigen salonfoto), ingesteld in `content/images.ts`.
- **Domein**: zet `NEXT_PUBLIC_SITE_URL` (wordt gebruikt voor canonical, sitemap en Open Graph).

## Database en beheer instellen (Vercel)

1. Vercel → project **kadirshairstyle** → **Storage** → **Create Database** → **Neon (Postgres)** → koppel aan het project.
   Vercel zet dan automatisch `DATABASE_URL` (ook `POSTGRES_URL` wordt ondersteund).
2. **Settings → Environment Variables**: voeg `ADMIN_PASSWORD` toe (een sterk wachtwoord voor de kapper).
3. Redeploy. De tabellen en behandelingen worden bij het eerste bezoek automatisch aangemaakt.
4. Beheer: `https://<domein>/admin` → inloggen met `ADMIN_PASSWORD` (blijft 30 dagen ingelogd).

In het beheer kan de kapper per dag alle afspraken zien (met telefoonnummer om te bellen),
een afspraak **verzetten** (vrije tijden of zelf een tijd kiezen) en **verwijderen**.

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
