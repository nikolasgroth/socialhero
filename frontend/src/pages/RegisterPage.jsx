import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, ArrowLeft } from '../components/Icons';
import LegalLinks from '../components/LegalLinks';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login, socialLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    if (isLogin) {
      if (!email || !password) { setError('Bitte fülle alle Felder aus'); return; }
    } else {
      if (!name || !email || !password) { setError('Bitte fülle alle Felder aus'); return; }
      if (!acceptedTerms) { setError('Bitte akzeptiere die Nutzungsbedingungen und Datenschutzerklärung'); return; }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/role-selection');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider) => {
    // In production, this would trigger the OAuth flow and return an id_token
    // For now, we show a message about configuration
    setError(`${provider === 'google' ? 'Google' : 'Apple'} Login erfordert OAuth-Konfiguration in der .env Datei. Bitte nutze die E-Mail-Registrierung.`);
  };

  return (
    <div className="animate-fade" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      padding: '60px 28px 40px',
      background: `radial-gradient(circle at 50% 20%, rgba(255,59,92,0.08) 0%, var(--bg) 60%)`,
    }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: 'var(--primary)', marginBottom: 16 }}><Shield size={48} /></div>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          {isLogin ? 'Anmelden' : 'Konto erstellen'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          {isLogin ? 'Willkommen zurück!' : 'Registriere dich, um Teil der Community zu werden'}
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255,59,92,0.1)', border: '1px solid var(--primary)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          color: 'var(--primary)', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-outline" onClick={() => handleSocial('apple')} style={{ gap: 12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C3.79 16.17 4.36 9.05 8.93 8.78c1.27.07 2.15.72 2.91.76.93-.19 1.82-.87 2.83-.79 1.19.1 2.09.59 2.68 1.49-2.46 1.48-1.87 4.72.48 5.63-.57 1.49-1.3 2.95-2.78 4.41zM12.05 8.72c-.15-2.35 1.72-4.34 3.95-4.52.29 2.63-2.37 4.63-3.95 4.52z" />
          </svg>
          Mit Apple fortfahren
        </button>
        <button className="btn btn-outline" onClick={() => handleSocial('google')} style={{ gap: 12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Mit Google fortfahren
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '4px 0 20px' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>oder</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!isLogin && (
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Name</label>
            <input className="input" placeholder="Dein Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>E-Mail</label>
          <input className="input" placeholder="name@beispiel.de" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Passwort</label>
          <input className="input" placeholder="Min. 8 Zeichen" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {!isLogin && (
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ marginTop: 3 }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Ich akzeptiere die{' '}
              <a href="/nutzungsbedingungen" onClick={(e) => { e.preventDefault(); navigate('/nutzungsbedingungen'); }} style={{ color: 'var(--primary)' }}>Nutzungsbedingungen</a>
              {' '}und die{' '}
              <a href="/datenschutz" onClick={(e) => { e.preventDefault(); navigate('/datenschutz'); }} style={{ color: 'var(--primary)' }}>Datenschutzerklärung</a>.
            </span>
          </label>
        )}
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Wird geladen...' : (isLogin ? 'Anmelden' : 'Registrieren')}
        </button>
      </div>

      <button className="btn btn-ghost" onClick={() => setIsLogin(!isLogin)} style={{ marginTop: 16 }}>
        {isLogin ? 'Noch kein Konto? Registrieren' : 'Bereits registriert? Anmelden'}
      </button>

      <button className="btn btn-ghost" onClick={() => navigate('/onboarding')} style={{ marginTop: 4 }}>
        <ArrowLeft size={16} /> Zurück
      </button>

      <LegalLinks />
    </div>
  );
}
