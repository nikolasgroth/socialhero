import { useMission } from '../contexts/MissionContext';
import { AlertTriangle, Check, X } from './Icons';

export default function IncomingAlert() {
  const { incomingAlert, acceptCountdown, acceptAlert, declineAlert } = useMission();

  if (!incomingAlert) return null;

  return (
    <div className="overlay">
      <div className="overlay-card">
        <div style={{ color: 'var(--primary)', marginBottom: 16 }}>
          <AlertTriangle size={40} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Hilferuf!</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 4 }}>
          Eine Person in deiner Nähe braucht Hilfe
        </p>
        {incomingAlert.sender_name && (
          <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 20 }}>
            von {incomingAlert.sender_name}
          </p>
        )}

        <div
          className="countdown-circle"
          style={{
            color: acceptCountdown <= 10 ? 'var(--danger)' : 'var(--warning)',
            borderColor: acceptCountdown <= 10 ? 'var(--danger)' : 'var(--warning)',
            marginBottom: 24,
          }}
        >
          {acceptCountdown}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" onClick={declineAlert} style={{ flex: 1, padding: 14 }}>
            <X size={18} /> Ablehnen
          </button>
          <button className="btn btn-success" onClick={acceptAlert} style={{ flex: 1, padding: 14 }}>
            <Check size={18} /> Annehmen
          </button>
        </div>
      </div>
    </div>
  );
}
