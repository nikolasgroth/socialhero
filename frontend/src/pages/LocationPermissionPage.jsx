import { Link } from 'react-router-dom';

export default function LocationPermissionPage({ onContinue }) {
  return (
    <div className="animate-fade" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      padding: '60px 28px 40px', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 30%, rgba(255,59,92,0.08) 0%, var(--bg) 60%)',
    }}>
      <div style={{ color: 'var(--primary)', marginBottom: 24 }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s-8-4.5-8-11.5A8 8 0 0 1 12 2a8 8 0 0 1 8 8.5c0 7-8 11.5-8 11.5z" />
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>
        Warum „Standort immer“?
      </h2>
      <p style={{
        color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7,
        fontSize: 15, maxWidth: 320, marginBottom: 20,
      }}>
        SocialHero braucht Zugriff auf deinen Standort <strong style={{ color: 'var(--text)' }}>auch im Hintergrund</strong>, damit du als Helfer gefunden werden kannst, wenn jemand in deiner Nähe Hilfe braucht.
      </p>
      <p style={{
        color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7,
        fontSize: 14, maxWidth: 320, marginBottom: 24,
      }}>
        Dein Standort wird <strong style={{ color: 'var(--text)' }}>nur aktiv genutzt</strong>, wenn du selbst einen Hilferuf auslöst oder wenn jemand in deiner Nähe Hilfe braucht und du alarmiert wirst.
      </p>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 16, maxWidth: 320, marginBottom: 28,
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: 'var(--text)' }}>Datenschutz:</strong> Standortdaten werden nur während aktiver Einsätze temporär gespeichert. Die Verarbeitung erfolgt auf Grundlage deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Du kannst die Berechtigung jederzeit in den Geräteeinstellungen widerrufen.
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-primary" onClick={onContinue}>
          Weiter – Standort aktivieren
        </button>
        <Link to="/datenschutz" style={{
          color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', textDecoration: 'none',
        }}>
          Mehr zum Datenschutz
        </Link>
      </div>
    </div>
  );
}
