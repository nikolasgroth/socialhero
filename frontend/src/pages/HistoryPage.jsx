import { useEffect } from 'react';
import { useMission } from '../contexts/MissionContext';
import { History as HistoryIcon } from '../components/Icons';

export default function HistoryPage() {
  const { history, loadHistory } = useMission();

  useEffect(() => { loadHistory(); }, [loadHistory]);

  return (
    <div className="animate-fade" style={{ padding: '60px 24px 100px' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Einsatzhistorie</h2>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ color: 'var(--text-dim)', marginBottom: 16 }}><HistoryIcon /></div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Noch keine Einsätze</p>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>
            Abgeschlossene Einsätze erscheinen hier
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((m) => (
            <div key={m.id} className="card" style={{ animation: 'slideInRight 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1,
                  color: m.role === 'helper' ? 'var(--accent)' : 'var(--primary)',
                  background: m.role === 'helper' ? 'rgba(0,229,160,0.1)' : 'var(--primary-soft)',
                  padding: '4px 10px', borderRadius: 6,
                }}>
                  {m.role === 'helper' ? 'Helfer' : 'Hilferuf'}
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>
                  {new Date(m.created_at).toLocaleDateString('de-DE')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 2 }}>Beginn</div>
                  <div style={{ fontSize: 13 }}>{new Date(m.created_at).toLocaleTimeString('de-DE')}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 2 }}>Ende</div>
                  <div style={{ fontSize: 13 }}>
                    {m.ended_at ? new Date(m.ended_at).toLocaleTimeString('de-DE') : '--'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 2 }}>Dauer</div>
                  <div style={{ fontSize: 13 }}>
                    {m.duration_minutes != null ? `${m.duration_minutes} Min.` : '--'}
                  </div>
                </div>
              </div>
              {m.role === 'helper' && m.sender_name && (
                <div style={{ marginTop: 8, color: 'var(--text-dim)', fontSize: 12 }}>
                  Hilfe für {m.sender_name}
                </div>
              )}
              {m.role === 'sender' && (
                <div style={{ marginTop: 8, color: 'var(--text-dim)', fontSize: 12 }}>
                  {m.helpers_accepted} Helfer haben reagiert
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
