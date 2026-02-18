import { Link } from 'react-router-dom';

export default function LegalLinks() {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center',
      marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)',
    }}>
      <Link to="/datenschutz" style={{ color: 'var(--text-muted)', fontSize: 12, textDecoration: 'none' }}>
        Datenschutz
      </Link>
      <Link to="/impressum" style={{ color: 'var(--text-muted)', fontSize: 12, textDecoration: 'none' }}>
        Impressum
      </Link>
      <Link to="/nutzungsbedingungen" style={{ color: 'var(--text-muted)', fontSize: 12, textDecoration: 'none' }}>
        Nutzungsbedingungen
      </Link>
    </div>
  );
}
