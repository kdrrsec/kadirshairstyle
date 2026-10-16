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
- **Behandelingen**: Knippen €25 (30 min), Knippen & baard €30 (40 min), Kinderen t/m 12 jaar €20 (30 min), Baard modelleren €15 (20 min) (`treatments` in `content/site.ts`). Een afspraak houdt precies die tijd vast; overlap kan niet. Starttijden zijn elk heel en half uur, plus direct aansluitend op (of vlak vóór) een andere afspraak of blokkade, zodat er geen gaten in de agenda vallen (`lib/schedule.ts`). Wijzigingen worden bij de start van de server naar de database gesynchroniseerd; weggehaalde diensten worden inactief (oude afspraken blijven zichtbaar in het beheer).
- **Logo**: `public/logo.png` (donker) en `public/logo-light.png` (licht), met slogan; `public/logo-compact.png` / `logo-compact-light.png` zonder slogan (navigatie en beheer). Allemaal transparant. De favicon (`app/icon.png`, `app/apple-icon.png`) is de schaar uit het logo.
- **Hero-foto**: `public/hero-kadirshairstyle.jpg` (eigen salonfoto), ingesteld in `content/images.ts`.
- **Domein**: zet `NEXT_PUBLIC_SITE_URL` (wordt gebruikt voor canonical, sitemap en Open Graph).

## Bescherming tegen spam bij online boeken

- **Telefoonnummer wordt gecontroleerd** (libphonenumber): het nummer moet echt kunnen bestaan. 0800/0900-nummers en duidelijk verzonnen nummers (06 12345678, 06 00000000) worden geweigerd. Buitenlandse nummers kunnen met +landcode. Het nummer wordt netjes opgeslagen (bijv. `06 19201856`).
- **Maximaal 2 openstaande afspraken per telefoonnummer.**
- **Maximaal 3 boekingen per dag vanaf hetzelfde internetadres**, en maximaal 8 pogingen per 10 minuten.
- **Bots worden tegengehouden** met een onzichtbaar veld en een minimale invultijd.
- IP-adressen worden niet opgeslagen, alleen een onomkeerbare hash (AVG-vriendelijk).

- **Cloudflare Turnstile** ("ik ben een mens"-vinkje), gratis. Aanzetten: maak op dash.cloudflare.com → Turnstile een widget (modus *Managed*, hostnames van de site) en zet `NEXT_PUBLIC_TURNSTILE_SITE_KEY` en `TURNSTILE_SECRET_KEY` in Vercel, daarna redeployen. Zonder sleutels staat het vinkje uit. Is Cloudflare zelf onbereikbaar, dan gaan boekingen gewoon door (de andere regels blijven gelden).

De grenzen staan in `lib/antispam.ts` (`LIMITS`).

## Privacy (AVG)

- Privacyverklaring op `/privacy` (link in de footer en bij het boekformulier).
- **Bewaartermijn:** afspraken worden 6 maanden na de afspraakdatum automatisch gewist (`lib/retention.ts`, draait elke ochtend mee met de cron). De IP-hash van een boeking wordt na 1 dag gewist.
- Functies draaien in **Frankfurt** (`regions: ["fra1"]` in `vercel.json`), net als de Neon-database.
- Geen analytics of trackingcookies; lettertypes en video's staan op de site zelf.

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

Via AxaWeb Meldingen (eigen WhatsApp-dienst op `meldingen.axaweb.nl`) krijgt de kapper:
- bij elke online boeking een bericht met naam, dienst, datum/tijd en telefoonnummer;
- elke ochtend (op open dagen, tussen 9 en 10 uur in de zomer, tussen 8 en 9 uur in de winter) een overzicht van alle afspraken van die dag.

Het dagoverzicht is een Vercel Cron (`vercel.json`) op `/api/cron/dagoverzicht`, beveiligd met `CRON_SECRET`.
In het beheer kan het met de knop **Dagoverzicht** ook direct (opnieuw) worden verstuurd.

1. Sla op de telefoon van de kapper het AxaWeb-afzendnummer op als contact.
2. Stuur vanaf de WhatsApp van de kapper het bericht `START Kadirs Hairstyle` naar dat contact.
3. Je krijgt binnen een paar seconden een bericht terug met een **apikey** en een testlink.
4. Vercel → **Settings → Environment Variables**: zet `WHATSAPP_PHONE` (bijv. `31612345678`) en `WHATSAPP_APIKEY`, en redeploy.

Sleutel kwijt? Stuur `SLEUTEL`. Nieuwe sleutel nodig? Stuur `NIEUWE SLEUTEL` (en pas `WHATSAPP_APIKEY` aan).
(De oude CallMeBot-variabelen `CALLMEBOT_PHONE`/`CALLMEBOT_APIKEY` werken nog zolang `WHATSAPP_APIKEY` leeg is.)

Zonder deze variabelen gebeurt er niets. Lukt een melding een keer niet, dan gaat de boeking gewoon door.

## Agenda beheren via WhatsApp

De kapper kan zijn agenda ook regelen door een WhatsApp te sturen naar het AxaWeb-afzendnummer:

| Bericht | Wat er gebeurt |
| --- | --- |
| `AFSPRAAK 11-11 11:15 Jan Jansen knippen` | Afspraak inplannen (telefoonnummer erachter mag). Bezet? Dan komen er vrije tijden terug. |
| `BLOKKEER 24-10` / `BLOKKEER 24-10 13:00-17:00` / `BLOKKEER 24-10 t/m 26-10` | Dag(deel) dicht: online boeken kan dan niet |
| `VRIJ 24-10` | Blokkade weghalen |
| `VANDAAG`, `MORGEN`, `AGENDA 11-11` | Afspraken van die dag |
| `ANNULEER 42` | Afspraak 42 annuleren |
| `HELP` | Overzicht |

Werking: AxaWeb Meldingen stuurt berichten van `WHATSAPP_PHONE` (ondertekend met
`WHATSAPP_WEBHOOK_SECRET`) naar `/api/whatsapp`; het antwoord gaat via WhatsApp terug.
De woorden voor diensten staan bij `aliases` in `content/site.ts`.

## Domein

Het echte adres is **https://www.kadirshairstyle.nl** (`site.url` in `content/site.ts`);
`kadirshairstyle.nl` stuurt via Vercel door naar www. De oude adressen
(`kadirshairstyle.axaweb.nl`, `kadirshairstyle.vercel.app`) sturen bezoekers via
`proxy.ts` door naar het echte domein, behalve `/api/*`, zodat de WhatsApp-koppeling
en de cron blijven werken. De QR-code op het TV-scherm wijst altijd naar `site.url`.

## Schakelaar "We gaan binnenkort live"

Zet in Vercel (Settings → Environment Variables) `COMING_SOON` op `1` en
redeploy: elke bezoeker ziet dan op elke pagina de pagina `/binnenkort`. Zet
hem op `0` (en redeploy) om de site live te zetten.

Zelf de echte site bekijken terwijl de schakelaar aan staat: open één keer
`https://<domein>/?voorbeeld=<COMING_SOON_SECRET>`. Dat zet een cookie voor 90
dagen. Met `?voorbeeld=uit` haal je die weer weg. `/admin`, `/scherm`,
`/privacy` en de API blijven altijd bereikbaar. De logica staat in `proxy.ts`.

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
