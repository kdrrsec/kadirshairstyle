# Kadir's Hairstyle — Zutphen

One-page website met online reserveren voor Kadir's Hairstyle, kapsalon in Zutphen.
Gebouwd door AxaWeb met Next.js en TypeScript, in dezelfde opzet als de In2Hairstyle-website.

## Structuur

| Pad | Inhoud |
| --- | --- |
| `app/page.tsx` | De one-page website (zelfde opbouw als In2Hairstyle: hero, over ons, diensten + prijslijst, contact) |
| `app/afspraak/` | Reserveren: Dienst → Tijd → Gegevens → Klaar (zelfde flow als In2Hairstyle) |
| `app/admin/` | Beheer voor de kapper: inloggen, afspraken per dag bekijken, verzetten en verwijderen |
| `app/scherm/` | TV-scherm voor in de salon: tijd + voornaam van de afspraken van vandaag |
| `app/api/` | Behandelingen, beschikbaarheid, afspraken en beheer (Postgres) |
| `content/site.ts` | **Alle bedrijfsgegevens, behandelingen en openingstijden** |
| `content/images.ts` | **Hero-foto** |

## Nog in te vullen

Alles wat nog niet bekend is staat in `content/site.ts` op `null`. De website toont dan een nette placeholder.

- **Adres**: ingevuld (Troelstralaan 35, 7204 LC Zutphen). Google Maps en de routeknop gebruiken dit automatisch.
- **Telefoonnummer**: `site.phone`
- **Instagram / TikTok**: `site.instagram` en `site.tiktok` (profiellinks)
- **Video's**: plak links van TikTok-video's of Instagram-reels in `socialVideos` (in `content/site.ts`); ze verschijnen in de sectie "Bekijk ons werk"
- **Openingstijden**: ingevuld in `site.hours` (ma 11–16, di–do 10–18, vr 10–20, za 10–17, zo gesloten). Het reserveringssysteem gebruikt deze tijden ook.
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

## TV-scherm in de salon

Open op de TV (of een laptop/stick eraan): `https://<domein>/scherm?code=<SCREEN_TOKEN>`.
Het scherm toont alleen tijd en voornaam, ververst elke 30 seconden en verbergt afspraken die geweest zijn.
Klik één keer voor volledig scherm. Ingelogd in het beheer kan het ook via de knop **TV-scherm**.
`SCREEN_TOKEN` staat als omgevingsvariabele in Vercel; wijzig die om oude links ongeldig te maken.

## WhatsApp-berichten naar de kapper

Via de gratis dienst CallMeBot krijgt de kapper:
- bij elke online boeking een bericht met naam, dienst, datum/tijd en telefoonnummer;
- elke ochtend (op open dagen, tussen 9 en 10 uur in de zomer, tussen 8 en 9 uur in de winter) een overzicht van alle afspraken van die dag.

Het dagoverzicht is een Vercel Cron (`vercel.json`) op `/api/cron/dagoverzicht`, beveiligd met `CRON_SECRET`.

1. Sla op de telefoon van de kapper het actuele CallMeBot-nummer op als contact (staat op callmebot.com, zoek op "WhatsApp API").
2. Stuur vanaf de WhatsApp van de kapper het bericht `I allow callmebot to send me messages` naar dat contact.
3. Je krijgt een bericht terug met een **apikey**.
4. Vercel → **Settings → Environment Variables**: zet `CALLMEBOT_PHONE` (bijv. `+31612345678`) en `CALLMEBOT_APIKEY`, en redeploy.

Zonder deze variabelen gebeurt er niets. Lukt een melding een keer niet, dan gaat de boeking gewoon door.

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
