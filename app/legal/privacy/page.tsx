export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-display font-bold text-3xl mb-2">
        Datenschutzerklärung
      </h1>
      <p className="text-zinc-500 text-sm mb-4">Stand: März 2026</p>
      <p className="text-xs text-zinc-400 bg-zinc-50 border border-zinc-200 px-3 py-2 mb-10">
        Hinweis: Die Benutzeroberfläche der Plattform ist auf Englisch gehalten. Diese Rechtstexte sind gemäß deutschem Recht auf Deutsch verfasst.
      </p>

      <div className="space-y-10 text-sm leading-relaxed text-zinc-700">

        {/* 1 */}
        <section>
          <h2 className="font-display font-bold text-lg text-black mb-3">
            1. Verantwortlicher
          </h2>
          <p>
            Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO)
            ist:
          </p>
          <p className="mt-3">
            A.S. Faizan Mohammed
            <br />
            Traunsteiner Str. 1
            <br />
            81549 München
            <br />
            Deutschland
            <br />
            E-Mail:{" "}
            <a
              href="mailto:roomrush.app@gmail.com"
              className="text-rose-600 hover:underline"
            >
              roomrush.app@gmail.com
            </a>
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-display font-bold text-lg text-black mb-3">
            2. Welche Daten wir erheben und warum
          </h2>
          <p className="mb-4">
            Wir erheben nur die Daten, die für den Betrieb der Plattform
            notwendig sind. Im Einzelnen:
          </p>

          <h3 className="font-semibold text-black mb-2">
            a) Beim Besuch der Website
          </h3>
          <p className="mb-4">
            Beim Aufrufen unserer Website werden durch den Browser automatisch
            folgende Daten an unseren Hosting-Anbieter (Vercel Inc., USA)
            übermittelt:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4 text-zinc-600">
            <li>IP-Adresse</li>
            <li>Datum und Uhrzeit des Zugriffs</li>
            <li>Browser-Typ und -Version</li>
            <li>Betriebssystem</li>
            <li>Aufgerufene URL</li>
          </ul>
          <p className="mb-4">
            Diese Daten werden nur zur technischen Bereitstellung der Website
            verarbeitet und nicht mit anderen Daten verknüpft. Rechtsgrundlage
            ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem
            sicheren und funktionierenden Betrieb der Website).
          </p>

          <h3 className="font-semibold text-black mb-2">
            b) Bei der Registrierung / Anmeldung
          </h3>
          <p className="mb-4">
            Wenn du ein Konto erstellst, erheben wir:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4 text-zinc-600">
            <li>E-Mail-Adresse</li>
            <li>Vollständiger Name (freiwillig)</li>
            <li>Passwort (verschlüsselt gespeichert, nie im Klartext)</li>
          </ul>
          <p>
            Diese Daten werden ausschließlich für die Verwaltung deines Kontos
            und die Nutzung der Plattform verwendet. Rechtsgrundlage ist Art. 6
            Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>

          <h3 className="font-semibold text-black mb-2 mt-4">
            c) Bei der Erstellung eines Inserats
          </h3>
          <p className="mb-4">
            Wenn du ein Inserat veröffentlichst, werden die von dir angegebenen
            Daten öffentlich sichtbar gespeichert:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4 text-zinc-600">
            <li>Titel, Beschreibung, Preis, Bezirk, Verfügbarkeitszeitraum</li>
            <li>Kontaktdaten (Name, E-Mail, Telefon, WhatsApp) – soweit angegeben</li>
            <li>Fotos der Unterkunft</li>
          </ul>
          <p>
            Du entscheidest selbst, welche Kontaktdaten du veröffentlichst.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-display font-bold text-lg text-black mb-3">
            3. Datenspeicherung und Dienstleister
          </h2>
          <p className="mb-4">
            Wir nutzen folgende externe Dienste:
          </p>

          <div className="space-y-4">
            <div className="border-l-2 border-zinc-200 pl-4">
              <p className="font-semibold text-black">Supabase</p>
              <p>
                Datenbank, Authentifizierung und Dateispeicherung werden über
                Supabase (Supabase Inc., USA) bereitgestellt. Die Daten werden
                auf Servern in der EU (Frankfurt) gespeichert. Supabase ist
                nach dem EU-US Data Privacy Framework zertifiziert.
              </p>
              <p className="mt-1">
                Datenschutzerklärung:{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-600 hover:underline"
                >
                  supabase.com/privacy
                </a>
              </p>
            </div>

            <div className="border-l-2 border-zinc-200 pl-4">
              <p className="font-semibold text-black">Vercel</p>
              <p>
                Das Hosting der Website erfolgt über Vercel Inc. (USA). Vercel
                verarbeitet automatisch technische Zugriffsdaten (siehe § 2a).
              </p>
              <p className="mt-1">
                Datenschutzerklärung:{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-600 hover:underline"
                >
                  vercel.com/legal/privacy-policy
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-display font-bold text-lg text-black mb-3">
            4. Cookies und Tracking
          </h2>
          <p className="mb-4">
            RoomRush verwendet keine Tracking-Cookies, keine Analyse-Tools
            (wie Google Analytics) und keine Werbe-Netzwerke. Technisch
            notwendige Session-Cookies (für die Anmeldung) werden von Supabase
            gesetzt und sind für den Betrieb der Plattform erforderlich.
          </p>
          <h3 className="font-semibold text-black mb-2">Browser-Speicher (localStorage)</h3>
          <p>
            Die Plattform nutzt den lokalen Browser-Speicher (localStorage) ausschließlich
            für funktionale Zwecke – konkret, um doppelte Aufrufe bei der Aufrufzählung
            von Inseraten zu verhindern (maximal ein Zählvorgang pro Browser und Inserat
            innerhalb von 24 Stunden). Dabei werden keinerlei personenbezogene Daten
            gespeichert. Einfache, aggregierte Nutzungsdaten (z. B. Gesamtanzahl der
            Aufrufe eines Inserats) werden ausschließlich zur Verbesserung der Plattform
            verwendet. Eine seitenübergreifende Verfolgung von Nutzern findet nicht statt.
            Es werden keine Drittanbieter-Marketing- oder Tracking-Tools eingesetzt.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am
            störungsfreien Betrieb der Plattform).
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-display font-bold text-lg text-black mb-3">
            5. Weitergabe von Daten an Dritte
          </h2>
          <p>
            Wir geben deine Daten nicht an Dritte weiter, es sei denn, dies
            ist zur Vertragserfüllung erforderlich (z. B. Speicherung bei
            Supabase) oder wir sind gesetzlich dazu verpflichtet. Eine
            Weitergabe zu Werbezwecken findet nicht statt.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-display font-bold text-lg text-black mb-3">
            6. Speicherdauer
          </h2>
          <p>
            Deine Daten werden gespeichert, solange dein Konto aktiv ist.
            Nach Löschung deines Kontos werden alle personenbezogenen Daten
            innerhalb von 30 Tagen gelöscht, soweit keine gesetzlichen
            Aufbewahrungspflichten bestehen.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-display font-bold text-lg text-black mb-3">
            7. Deine Rechte
          </h2>
          <p className="mb-3">
            Du hast nach der DSGVO folgende Rechte:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-600">
            <li>
              <strong className="text-black">Auskunft</strong> (Art. 15 DSGVO)
              — Du kannst jederzeit Auskunft über die gespeicherten Daten
              verlangen.
            </li>
            <li>
              <strong className="text-black">Berichtigung</strong> (Art. 16
              DSGVO) — Du kannst unrichtige Daten korrigieren lassen.
            </li>
            <li>
              <strong className="text-black">Löschung</strong> (Art. 17 DSGVO)
              — Du kannst die Löschung deiner Daten verlangen.
            </li>
            <li>
              <strong className="text-black">Einschränkung</strong> (Art. 18
              DSGVO) — Du kannst die Einschränkung der Verarbeitung verlangen.
            </li>
            <li>
              <strong className="text-black">Datenübertragbarkeit</strong>{" "}
              (Art. 20 DSGVO) — Du kannst eine maschinenlesbare Kopie deiner
              Daten verlangen.
            </li>
            <li>
              <strong className="text-black">Widerspruch</strong> (Art. 21
              DSGVO) — Du kannst der Verarbeitung deiner Daten widersprechen.
            </li>
          </ul>
          <p className="mt-4">
            Um deine Rechte auszuüben, schreibe uns eine E-Mail an:{" "}
            <a
              href="mailto:roomrush.app@gmail.com"
              className="text-rose-600 hover:underline"
            >
              roomrush.app@gmail.com
            </a>
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-display font-bold text-lg text-black mb-3">
            8. Beschwerderecht
          </h2>
          <p>
            Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu
            beschweren. Zuständig ist für Bayern:
          </p>
          <p className="mt-3">
            Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)
            <br />
            Promenade 18
            <br />
            91522 Ansbach
            <br />
            <a
              href="https://www.lda.bayern.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 hover:underline"
            >
              www.lda.bayern.de
            </a>
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="font-display font-bold text-lg text-black mb-3">
            9. Änderungen dieser Datenschutzerklärung
          </h2>
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf
            anzupassen. Die aktuelle Version ist stets auf dieser Seite
            abrufbar. Wesentliche Änderungen werden wir dir per E-Mail
            mitteilen.
          </p>
        </section>

      </div>
    </div>
  );
}
