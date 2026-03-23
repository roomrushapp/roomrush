export default function ImpressumPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-display font-bold text-3xl mb-2">Impressum</h1>
      <p className="text-zinc-500 text-sm mb-4">Angaben gemäß § 5 TMG</p>
      <p className="text-xs text-zinc-400 bg-zinc-50 border border-zinc-200 px-3 py-2 mb-10">
        Hinweis: Die Benutzeroberfläche der Plattform ist auf Englisch gehalten. Diese Rechtstexte sind gemäß deutschem Recht auf Deutsch verfasst.
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-zinc-700">
        <section>
          <h2 className="font-display font-bold text-base text-black mb-2 uppercase tracking-wide">
            Verantwortlich für den Inhalt
          </h2>
          <p>
            A.S. Faizan Mohammed
            <br />
            Traunsteiner Str. 1
            <br />
            81549 München
            <br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-base text-black mb-2 uppercase tracking-wide">
            Kontakt
          </h2>
          <p>
            E-Mail:{" "}
            <a
              href="mailto:roomrush.app@gmail.com"
              className="text-rose-600 hover:underline"
            >
              roomrush.app@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-base text-black mb-2 uppercase tracking-wide">
            Hinweis gemäß § 55 Abs. 2 RStV
          </h2>
          <p>
            RoomRush ist eine Privatperson und kein eingetragenes Unternehmen.
            Die Plattform dient der Vermittlung von Inseraten für
            Kurzzeitvermietungen in München. Es werden keine Zahlungen
            abgewickelt und keine Mietverträge abgeschlossen.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-base text-black mb-2 uppercase tracking-wide">
            Haftungsausschluss
          </h2>
          <p>
            RoomRush übernimmt keine Haftung für die Richtigkeit, Vollständigkeit
            oder Aktualität der auf der Plattform veröffentlichten Inserate. Die
            Verantwortung für den Inhalt der Inserate liegt bei den jeweiligen
            Nutzern. Alle Vereinbarungen zwischen Anbietern und Interessenten
            werden außerhalb dieser Plattform geschlossen.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-base text-black mb-2 uppercase tracking-wide">
            Streitschlichtung
          </h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            . Wir sind nicht bereit oder verpflichtet, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
          </p>
        </section>
      </div>
    </div>
  );
}
