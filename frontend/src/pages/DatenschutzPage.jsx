import { Link } from 'react-router-dom';

export default function DatenschutzPage() {
  return (
    <div className="animate-fade" style={{ padding: '60px 24px 100px', maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Datenschutzerklärung</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
        Stand: {new Date().toLocaleDateString('de-DE')} – Bitte vor Veröffentlichung von einem Anwalt prüfen lassen.
      </p>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>1. Verantwortlicher</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          [Name und Kontaktdaten des Verantwortlichen eintragen]
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>2. Erhobene Daten</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          SocialHero erhebt und verarbeitet folgende personenbezogene Daten: E-Mail-Adresse, Name, Passwort (verschlüsselt),
          Standortdaten (nur während einer aktiven Hilferuf-Situation), Geräte-Token für Push-Benachrichtigungen.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>3. Zweck der Verarbeitung</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          Die Daten werden zur Bereitstellung der App-Funktionen (Hilferuf, Benachrichtigung von Helfern in der Nähe),
          zur Authentifizierung und zur Kommunikation mit Nutzern verwendet.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>4. Rechtsgrundlage</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, z.B. für Standort).
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>5. Speicherdauer</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          Standortdaten werden nur während aktiver Einsätze temporär gespeichert. Account-Daten werden bis zur Löschung des Kontos gespeichert.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>6. Ihre Rechte</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit.
          Sie können Ihr Konto in den Einstellungen löschen. Bei Beschwerden: Aufsichtsbehörde für den Datenschutz.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>7. Cookies & Technik</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          SocialHero verwendet Session-Speicherung für die Anmeldung. Es werden keine Tracking-Cookies verwendet.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>8. Kontakt</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          [Kontakt-E-Mail für Datenschutzanfragen eintragen]
        </p>
      </section>

      <Link to="/register" style={{ color: 'var(--primary)', fontSize: 14, textDecoration: 'none' }}>
        ← Zurück zur Registrierung
      </Link>
    </div>
  );
}
