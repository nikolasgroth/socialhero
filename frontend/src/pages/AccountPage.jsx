import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { LogOut } from '../components/Icons';
import LegalLinks from '../components/LegalLinks';

export default function AccountPage() {
  const { user, logout, updateUser } = useAuth();
  const { connected } = useWebSocket();
  const { position } = useGeolocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const toggleShortcut = async () => {
    setLoading(true);
    try {
      await updateUser({ shortcut_enabled: !user.shortcut_enabled });
    } catch {}
    setLoading(false);
  };

  const toggleAvailable = async () => {
    setLoading(true);
    try {
      await updateUser({ is_available: !user.is_available });
    } catch {}
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/onboarding');
  };

  if (!user) return null;

  return (
    <div className="animate-fade" style={{ padding: '60px 24px 100px' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Mein Account</h2>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: 'var(--primary-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)', fontSize: 20, fontWeight: 700,
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{user.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Mitglied seit</span>
          <span style={{ fontSize: 13 }}>{new Date(user.created_at).toLocaleDateString('de-DE')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Login-Methode</span>
          <span style={{ fontSize: 13, textTransform: 'capitalize' }}>
            {user.auth_provider === 'email' ? 'E-Mail' : user.auth_provider}
          </span>
        </div>
      </div>

      {/* Settings card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Einstellungen</h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 14 }}>SOS-Shortcut</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Schnellzugriff vom Homescreen</div>
          </div>
          <button
            className={`toggle ${user.shortcut_enabled ? 'on' : 'off'}`}
            onClick={toggleShortcut}
            disabled={loading}
          >
            <div className="toggle-knob" />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 14 }}>Hilfsbereitschaft</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Einsatzanfragen empfangen</div>
          </div>
          <button
            className={`toggle ${user.is_available ? 'on' : 'off'}`}
            onClick={toggleAvailable}
            disabled={loading}
          >
            <div className="toggle-knob" />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
          <span style={{ fontSize: 14 }}>Verbindung</span>
          <span style={{ fontSize: 13, color: connected ? 'var(--accent)' : 'var(--warning)' }}>
            {connected ? '● Verbunden' : '○ Getrennt'}
          </span>
        </div>
      </div>

      {/* Status card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Status</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Standort</span>
          <span style={{ fontSize: 13, color: position ? 'var(--accent)' : 'var(--text-dim)' }}>
            {position ? `${position.lat.toFixed(3)}, ${position.lng.toFixed(3)}` : 'Nicht verfügbar'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>WebSocket</span>
          <span style={{ fontSize: 13 }}>{connected ? 'Aktiv' : 'Inaktiv'}</span>
        </div>
      </div>

      <button
        className="btn btn-outline"
        onClick={handleLogout}
        style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
      >
        <LogOut /> Abmelden
      </button>

      <LegalLinks />
    </div>
  );
}
