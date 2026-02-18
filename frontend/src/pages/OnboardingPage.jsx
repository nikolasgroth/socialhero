import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck } from '../components/Icons';
import LegalLinks from '../components/LegalLinks';

const steps = [
  {
    title: 'Willkommen bei SocialHero',
    desc: 'Dein Lebensretter in unangenehmen Situationen. Fühlst du dich bedroht oder brauchst Unterstützung, sind andere Menschen für dich da.',
    color: 'var(--primary)',
    bg: 'radial-gradient(circle at 50% 30%, rgba(255,59,92,0.15) 0%, transparent 60%)',
  },
  {
    title: 'Ein Knopfdruck genügt',
    desc: 'Drücke den SOS-Knopf und nach 5 Sekunden werden alle SocialHero-Nutzer im Umkreis von 1 km alarmiert. Sie erhalten deinen Standort und können dir zu Hilfe kommen.',
    color: 'var(--warning)',
    bg: 'radial-gradient(circle at 50% 30%, rgba(255,184,0,0.12) 0%, transparent 60%)',
  },
  {
    title: 'Gemeinsam sicher',
    desc: 'Helfer in deiner Nähe können den Einsatz annehmen. Sie sehen deinen Standort und navigieren direkt zu dir. Zusammen sind wir stärker.',
    color: 'var(--accent)',
    bg: 'radial-gradient(circle at 50% 30%, rgba(0,229,160,0.12) 0%, transparent 60%)',
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const current = steps[step];

  const goToRegister = () => {
    completeOnboarding();
    navigate('/register');
  };

  return (
    <div className="animate-fade" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      padding: '60px 28px 40px', background: current.bg,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: current.color, marginBottom: 24 }}>
          <ShieldCheck size={80} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
          {current.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7, fontSize: 15, maxWidth: 320 }}>
          {current.desc}
        </p>
      </div>

      <div className="progress-dots">
        {steps.map((_, i) => (
          <div key={i} className={`progress-dot ${i === step ? 'active' : ''}`} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {step < steps.length - 1 ? (
          <>
            <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Weiter</button>
            <button className="btn btn-ghost" onClick={goToRegister}>Überspringen</button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={goToRegister}>Jetzt registrieren</button>
        )}
      </div>
      <LegalLinks />
    </div>
  );
}
