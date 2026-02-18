import { Link } from 'react-router-dom';

export default function ImpressumPage() {
  return (
    <div className="animate-fade" style={{ padding: '60px 24px 100px', maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Impressum</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
        Angaben gemäß § 5 TMG – Bitte vor Veröffentlichung mit deinen Daten ausfüllen.
      </p>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Anbieter</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          [Firmenname oder Name]<br />
          [Straße, Hausnummer]<br />
          [PLZ Ort]<br />
          [Land]
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Kontakt</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          E-Mail: [Kontakt-E-Mail]<br />
          [Optional: Telefon]
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Vertretung</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          [Bei Unternehmen: Name, Vertretungsberechtigter]<br />
          [Registergericht, Handelsregisternummer falls vorhanden]
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Umsatzsteuer-ID</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          [Falls vorhanden: USt-IdNr. gemäß § 27a UStG]
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Verantwortlich für Inhalte</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          [Name und Adresse des Verantwortlichen]
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>EU-Streitschlichtung</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>https://ec.europa.eu/consumers/odr</a>
        </p>
      </section>

      <Link to="/register" style={{ color: 'var(--primary)', fontSize: 14, textDecoration: 'none' }}>
        ← Zurück zur Registrierung
      </Link>
    </div>
  );
}
