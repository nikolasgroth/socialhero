import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, AlertTriangle } from '../components/Icons';

export default function RoleSelectionPage() {
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const handleChoice = async (isAvailable) => {
    setLoading(true);
    try {
      await updateUser({ is_available: isAvailable });
      navigate('/setup');
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      padding: '80px 28px 40px', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 30%, rgba(255,59,92,0.08) 0%, var(--bg) 60%)',
    }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
        Wie möchtest du SocialHero nutzen?
      </h2>
      <p style={{
        color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7,
        fontSize: 14, maxWidth: 320, marginBottom: 28,
      }}>
        Wähle, ob du die App nur als Hilfesuchender nutzen oder auch bei Alarmen in deiner Nähe helfen möchtest.
      </p>

      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <button
          className="btn btn-outline"
          onClick={() => handleChoice(false)}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
            textAlign: 'left', justifyContent: 'flex-start',
          }}
        >
          <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
            <Shield size={32} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Nur SOS nutzen</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Ich nutze SocialHero nur als Hilfesuchender – wenn ich selbst Hilfe brauche.
            </div>
          </div>
        </button>

        <button
          className="btn btn-outline"
          onClick={() => handleChoice(true)}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
            textAlign: 'left', justifyContent: 'flex-start',
          }}
        >
          <div style={{ color: 'var(--accent)', flexShrink: 0 }}>
            <AlertTriangle size={32} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Auch bei Alarmen helfen</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Ich möchte bei SOS-Alarmen in meiner Nähe benachrichtigt werden und helfen können.
            </div>
          </div>
        </button>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 16, maxWidth: 320, marginBottom: 28,
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: 'var(--text)' }}>Hinweis:</strong> Die Teilnahme an Einsätzen ist freiwillig und erfolgt auf eigene Gefahr. Selbstschutz hat immer Vorrang – du kannst jederzeit ablehnen oder einen Einsatz beenden.
        </p>
      </div>

      <button className="btn btn-ghost" onClick={() => handleChoice(false)} disabled={loading}>
        Später entscheiden
      </button>
    </div>
  );
}
