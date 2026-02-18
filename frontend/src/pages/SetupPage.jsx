import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SetupPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const enableShortcut = async () => {
    try { await updateUser({ shortcut_enabled: true }); } catch {}
    navigate('/');
  };

  return (
    <div className="animate-fade" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      padding: '80px 28px 40px', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 30%, rgba(255,59,92,0.08) 0%, var(--bg) 60%)',
    }}>
      <div style={{ color: 'var(--primary)', marginBottom: 24 }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
        Schnellzugriff einrichten?
      </h2>
      <p style={{
        color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7,
        fontSize: 14, maxWidth: 300, marginBottom: 32,
      }}>
        Richte einen Shortcut ein, um den SOS-Alarm noch schneller auszulösen – direkt vom Homescreen oder per Tastenkombination.
      </p>

      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-primary" onClick={enableShortcut}>
          Shortcut aktivieren
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          Später einrichten
        </button>
      </div>
    </div>
  );
}
