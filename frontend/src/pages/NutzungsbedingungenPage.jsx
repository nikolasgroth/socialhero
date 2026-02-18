import { Link } from 'react-router-dom';

export default function NutzungsbedingungenPage() {
  return (
    <div className="animate-fade" style={{ padding: '60px 24px 100px', maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Nutzungsbedingungen</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
        Stand: {new Date().toLocaleDateString('de-DE')} – Bitte vor Veröffentlichung von einem Anwalt prüfen lassen.
      </p>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>1. Geltungsbereich</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          Diese Nutzungsbedingungen gelten für die Nutzung der SocialHero-App. Mit der Registrierung akzeptieren Sie diese Bedingungen.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>2. Leistungsbeschreibung</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          SocialHero verbindet Nutzer in Notsituationen mit hilfsbereiten Personen in der Nähe. Die App ersetzt nicht den Notruf (112),
          sondern ergänzt ihn. Bei lebensbedrohlichen Situationen ist stets der Notruf zu wählen.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>3. Registrierung und Account</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          Sie müssen sich für die Nutzung registrieren. Sie sind verpflichtet, wahrheitsgemäße Angaben zu machen. Für die Sicherheit
          Ihres Passworts sind Sie selbst verantwortlich. Sie können Ihr Konto jederzeit in den Einstellungen löschen.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>4. Verbotene Nutzung</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          Missbrauch der SOS-Funktion (z.B. falsche Alarmierung, Test ohne echten Bedarf) ist untersagt. Wiederholter Missbrauch
          führt zur Sperrung des Accounts. Die App darf nicht für illegale Zwecke genutzt werden.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>5. Haftung</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          SocialHero übernimmt keine Haftung für die Verfügbarkeit von Helfern oder die tatsächliche Hilfeleistung. Die Nutzung
          erfolgt auf eigenes Risiko. Die Haftung für Vorsatz und grobe Fahrlässigkeit bleibt unberührt.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>6. Änderungen</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          Wir behalten uns vor, diese Nutzungsbedingungen zu ändern. Bei wesentlichen Änderungen werden wir Sie per E-Mail oder
          in der App informieren. Die fortgesetzte Nutzung gilt als Zustimmung.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>7. Schlussbestimmungen</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
          Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist [Ort] sofern gesetzlich zulässig.
        </p>
      </section>

      <Link to="/register" style={{ color: 'var(--primary)', fontSize: 14, textDecoration: 'none' }}>
        ← Zurück zur Registrierung
      </Link>
    </div>
  );
}
