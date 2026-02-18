import { useAuth } from '../contexts/AuthContext';
import { useMission } from '../contexts/MissionContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { AlertTriangle, Phone, Navigation } from '../components/Icons';

export default function HomePage() {
  const { user } = useAuth();
  const { position } = useGeolocation();
  const {
    activeMission, missionRole, alertCountdown,
    triggerSOS, cancelSOS, endMission, openNavigation,
  } = useMission();

  // Active mission as SENDER
  if (activeMission && missionRole === 'sender') {
    return (
      <div className="animate-fade" style={{
        padding: '60px 24px 100px',
        background: 'linear-gradient(180deg, rgba(255,59,92,0.08) 0%, var(--bg) 40%)',
        minHeight: '100vh',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: 'var(--primary)',
            animation: 'glow 2s ease infinite', border: '2px solid var(--primary)',
          }}>
            <AlertTriangle />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Hilferuf aktiv</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Dein Standort wird an Helfer in der Nähe gesendet
          </p>
        </div>

        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Helfer unterwegs</span>
            <span style={{ color: 'var(--accent)', fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 20 }}>
              {activeMission.helpers_accepted || 0}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Alarmiert</span>
            <span style={{ fontSize: 13 }}>{activeMission.helpers_alerted || 0} Personen</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Seit</span>
            <span style={{ fontSize: 13 }}>
              {new Date(activeMission.created_at).toLocaleTimeString('de-DE')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="btn btn-outline"
            onClick={() => window.open('tel:112', '_self')}
            style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}
          >
            <Phone /> Notruf 112 wählen
          </button>
          <button className="btn btn-danger" onClick={endMission}>
            Einsatz beenden
          </button>
        </div>
      </div>
    );
  }

  // Active mission as HELPER
  if (activeMission && missionRole === 'helper') {
    return (
      <div className="animate-fade" style={{
        padding: '60px 24px 100px',
        background: 'linear-gradient(180deg, rgba(0,229,160,0.06) 0%, var(--bg) 40%)',
        minHeight: '100vh',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,229,160,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: 'var(--accent)', border: '2px solid var(--accent)',
          }}>
            <Navigation />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Einsatz angenommen</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Navigiere zum Hilferufenden
          </p>
        </div>

        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Person</span>
            <span style={{ fontSize: 14 }}>{activeMission.sender_name || 'Unbekannt'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Standort</span>
            <span style={{ fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
              {activeMission.lat?.toFixed(4)}, {activeMission.lng?.toFixed(4)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn btn-success" onClick={openNavigation}>
            <Navigation /> Navigation öffnen
          </button>
          <button
            className="btn btn-outline"
            onClick={() => window.open('tel:112', '_self')}
            style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}
          >
            <Phone /> Notruf 112
          </button>
          <button className="btn btn-danger" onClick={endMission}>
            Einsatz beenden
          </button>
        </div>
      </div>
    );
  }

  // DEFAULT: SOS Button
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px 120px',
      background: 'radial-gradient(circle at 50% 45%, rgba(255,59,92,0.06) 0%, var(--bg) 50%)',
    }}>
      {alertCountdown !== null ? (
        <div className="animate-fade" style={{ textAlign: 'center' }}>
          <div
            className="countdown-circle"
            style={{ color: 'var(--primary)', borderColor: 'var(--primary)', marginBottom: 24 }}
          >
            {alertCountdown}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Alarm wird gesendet...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
            Helfer werden in {alertCountdown} Sekunden alarmiert
          </p>
          <button className="btn btn-outline" onClick={cancelSOS} style={{ maxWidth: 260, margin: '0 auto' }}>
            Abbrechen
          </button>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 4 }}>
              Hallo, {user?.name}
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
              {position
                ? `Standort aktiv • ${position.lat.toFixed(3)}, ${position.lng.toFixed(3)}`
                : 'Standort wird ermittelt...'}
            </p>
          </div>

          <div style={{ position: 'relative', marginBottom: 40 }}>
            <button className="sos-btn" onClick={triggerSOS}>
              <div className="ring" />
              <div className="ring ring2" />
              SOS
            </button>
          </div>

          <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', maxWidth: 240 }}>
            Tippe, um Helfer in deiner Nähe zu alarmieren
          </p>
        </>
      )}
    </div>
  );
}
