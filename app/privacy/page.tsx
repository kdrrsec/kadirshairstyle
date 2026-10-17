import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { fullAddress, site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Privacyverklaring',
  description: `Hoe ${site.name} in ${site.city} omgaat met je persoonsgegevens bij het online maken van een afspraak.`,
  alternates: { canonical: '/privacy' },
};

const UPDATED = '14 oktober 2026';

export default function PrivacyPage() {
  const address = fullAddress();
  return (
    <>
      <Navbar />
      <main className="section legal">
        <div className="container legal-inner">
          <p className="eyebrow">Privacy</p>
          <h1>Privacyverklaring</h1>
          <p className="legal-updated">Laatst bijgewerkt: {UPDATED}</p>

          <p>
            {site.name} gaat zorgvuldig om met je persoonsgegevens. In deze verklaring lees je welke gegevens we
            verzamelen als je via deze website een afspraak maakt, waarom we dat doen en wat je rechten zijn. We houden
            ons aan de Algemene Verordening Gegevensbescherming (AVG).
          </p>

          <h2>Wie is verantwoordelijk?</h2>
          <p>
            {site.name}
            {address && <>, {address}</>}. Vragen over je gegevens kun je stellen in de salon
            {site.phone && (
              <>
                {' '}
                of telefonisch via <a href={`tel:${site.phone.href}`}>{site.phone.display}</a>
              </>
            )}
            .
          </p>

          <h2>Welke gegevens en waarom?</h2>
          <ul>
            <li>
              <strong>Naam en telefoonnummer</strong> om je afspraak vast te leggen en je te kunnen bereiken als er iets
              verandert.
            </li>
            <li>
              <strong>Je afspraak</strong> (dienst, datum en tijd) om de agenda bij te houden.
            </li>
            <li>
              <strong>Technische gegevens tegen spam</strong>: van je internetadres (IP-adres) bewaren we alleen een
              onomkeerbare code, nooit het adres zelf. Daarmee voorkomen we dat iemand de agenda volboekt. Deze code
              wordt na 1 dag gewist.
            </li>
          </ul>
          <p>
            De grondslag is het uitvoeren van de afspraak die je met ons maakt, en ons gerechtvaardigd belang bij het
            tegengaan van misbruik. We gebruiken je gegevens niet voor reclame en verkopen ze nooit aan anderen.
          </p>

          <h2>Hoe lang bewaren we je gegevens?</h2>
          <p>
            Afspraken worden <strong>6 maanden na de afspraakdatum automatisch gewist</strong>. Wijzigingen in de agenda
            (zoals een geannuleerde afspraak) staan tot die tijd in ons logboek, zodat we kunnen nagaan wat er is
            gebeurd. Wil je dat je gegevens eerder worden gewist? Laat het ons weten, dan doen we dat.
          </p>

          <h2>Derde partijen</h2>
          <p>
            Voor de website en het afsprakensysteem werken we met een aantal zorgvuldig gekozen derde partijen. Zij
            verwerken je gegevens alleen in onze opdracht en alleen voor het doel waarvoor wij ze inschakelen:
          </p>
          <ul>
            <li>het bouwen, beheren en hosten van de website;</li>
            <li>het veilig opslaan van de afspraken, op servers binnen de Europese Unie;</li>
            <li>de controle bij het boeken of je geen robot bent, zonder trackingcookies;</li>
            <li>het doorsturen van je afspraak (naam, telefoonnummer, dienst en tijd) naar de kapper via WhatsApp.</li>
          </ul>
          <p>
            We verkopen je gegevens nooit en delen ze niet voor andere doeleinden. Komen gegevens toch buiten de EU
            terecht, dan gebeurt dat alleen met de waarborgen die de AVG daarvoor eist.
          </p>

          <h2>Cookies en kaart</h2>
          <p>
            Deze website gebruikt geen analytische of trackingcookies en we volgen je niet. Op de pagina staat een
            kaart van Google Maps om de route te tonen; bij het laden daarvan ontvangt Google technische gegevens zoals
            je IP-adres en kan Google cookies plaatsen. Lees daarover de{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              privacyverklaring van Google
            </a>
            .
          </p>

          <h2>Je rechten</h2>
          <p>
            Je mag je gegevens inzien, laten corrigeren of laten verwijderen, en je kunt bezwaar maken tegen het gebruik
            ervan. Vraag het gerust in de salon; we reageren binnen een maand. Ben je het niet eens met hoe we met je
            gegevens omgaan, dan kun je een klacht indienen bij de{' '}
            <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">
              Autoriteit Persoonsgegevens
            </a>
            .
          </p>

          <h2>Beveiliging</h2>
          <p>
            De website werkt alleen via een beveiligde verbinding (https). Het afsprakenoverzicht is afgeschermd met een
            wachtwoord en alleen toegankelijk voor de salon. Het TV-scherm in de salon toont alleen voornamen en tijden.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
