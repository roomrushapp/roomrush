export default function DisclaimerPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-display font-bold text-3xl mb-2">Haftungsausschluss</h1>
      <p className="text-zinc-500 text-sm mb-4">Rechtliche Hinweise zur Nutzung der Plattform</p>
      <p className="text-xs text-zinc-400 bg-zinc-50 border border-zinc-200 px-3 py-2 mb-10">
        Hinweis: Die Benutzeroberfläche der Plattform ist auf Englisch gehalten. Diese Rechtstexte sind gemäß deutschem Recht auf Deutsch verfasst.
      </p>
      <div className="space-y-6 text-sm leading-relaxed text-zinc-700">
        <div className="border-l-4 border-rose-600 pl-4 py-2 bg-zinc-50">
          <p className="font-medium text-black text-base">
            RoomRush zeigt ausschließlich Inserate an und übernimmt keine Verantwortung für Vereinbarungen zwischen Nutzern.
          </p>
        </div>
        <p>
          RoomRush ist eine Inseratsplattform. Wir veröffentlichen Untermiete-Anzeigen, die von Nutzern eingestellt werden. Wir überprüfen keine Inserate, wickeln keine Zahlungen ab und schließen keine Mietverträge ab.
        </p>
        <p>
          Alle Vereinbarungen, Verträge und Zahlungen werden direkt zwischen dem Anbieter und dem Interessenten getroffen – vollständig außerhalb der RoomRush-Plattform.
        </p>
        <p>
          RoomRush haftet nicht für die Richtigkeit der Inserate, das Verhalten der Nutzer oder etwaige Streitigkeiten aus Mietverhältnissen.
        </p>
        <p>
          Die Nutzung dieser Plattform erfolgt auf eigene Gefahr. Bitte überprüfen Sie Inserate und Kontaktdaten stets eigenständig, bevor Sie Verbindlichkeiten eingehen.
        </p>
      </div>
    </div>
  );
}
