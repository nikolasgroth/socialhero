import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useLocationExplanation } from './LocationExplanationContext';
import { useWebSocket } from './WebSocketContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { isNativePlatform } from '../utils/capacitor';
import { registerPlugin } from '@capacitor/core';
import api from '../services/api';

const BackgroundGeolocation = typeof window !== 'undefined' && isNativePlatform()
  ? registerPlugin('BackgroundGeolocation')
  : null;

const ALERT_COUNTDOWN = 5;
const ACCEPT_TIMEOUT = 30;

const MissionContext = createContext(null);

export function MissionProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { seen: locationExplanationSeen } = useLocationExplanation();
  const { send, subscribe } = useWebSocket();
  const { getPosition } = useGeolocation();

  const [activeMission, setActiveMission] = useState(null);
  const [missionRole, setMissionRole] = useState(null);
  const [alertCountdown, setAlertCountdown] = useState(null);
  const [incomingAlert, setIncomingAlert] = useState(null);
  const [acceptCountdown, setAcceptCountdown] = useState(null);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);

  const countdownRef = useRef(null);
  const acceptRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !locationExplanationSeen) return;

    if (BackgroundGeolocation) {
      let watcherId = null;
      BackgroundGeolocation.addWatcher(
        {
          requestPermissions: true,
          backgroundMessage: 'SocialHero sucht Helfer in deiner Nähe.',
          backgroundTitle: 'Standort aktiv',
          distanceFilter: 100,
        },
        (location, err) => {
          if (err) return;
          if (location) send('LOCATION_UPDATE', { lat: location.latitude, lng: location.longitude });
        }
      ).then((id) => { watcherId = id; }).catch(() => {});

      return () => {
        if (watcherId) BackgroundGeolocation.removeWatcher({ id: watcherId }).catch(() => {});
      };
    }

    getPosition(false).then((pos) => send('LOCATION_UPDATE', pos)).catch(() => {});
    const interval = setInterval(() => {
      getPosition(false).then((pos) => send('LOCATION_UPDATE', pos)).catch(() => {});
    }, 120000);
    return () => clearInterval(interval);
  }, [isAuthenticated, locationExplanationSeen, getPosition, send]);

  useEffect(() => {
    if (isAuthenticated) {
      api.getActiveMission().then((m) => {
        if (m) {
          setActiveMission(m);
          setMissionRole(m.sender_id === user?.id ? 'sender' : 'helper');
        }
      }).catch(() => {});
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubs = [
      subscribe('INCOMING_ALERT', (payload) => {
        setIncomingAlert(payload);
        setAcceptCountdown(payload.accept_timeout || ACCEPT_TIMEOUT);
      }),
      subscribe('LOCATION_REQUEST', () => {
        getPosition(true).then((pos) => {
          send('LOCATION_RESPONSE', pos);
        }).catch(() => {});
      }),
      subscribe('MISSION_HELPER_ACCEPTED', (payload) => {
        setActiveMission((m) => m ? {
          ...m,
          helpers_accepted: payload.helpers_accepted || (m.helpers_accepted + 1),
        } : m);
        showToast(`${payload.helper_name || 'Ein Helfer'} ist auf dem Weg!`);
      }),
      subscribe('MISSION_PRECISE_LOCATION', (payload) => {
        setActiveMission((m) => m ? { ...m, lat: payload.lat, lng: payload.lng } : m);
      }),
      subscribe('MISSION_ENDED', () => {
        showToast('Einsatz wurde beendet');
        setActiveMission(null);
        setMissionRole(null);
        loadHistory();
      }),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, [isAuthenticated, subscribe, getPosition, send, showToast]);

  useEffect(() => {
    if (acceptCountdown === null || acceptCountdown <= 0) return;
    acceptRef.current = setTimeout(() => {
      if (acceptCountdown <= 1) {
        setIncomingAlert(null);
        setAcceptCountdown(null);
        showToast('Einsatzanfrage abgelaufen');
      } else {
        setAcceptCountdown((c) => c - 1);
      }
    }, 1000);
    return () => clearTimeout(acceptRef.current);
  }, [acceptCountdown, showToast]);

  const loadHistory = useCallback(async () => {
    try {
      const items = await api.getMissionHistory();
      setHistory(items);
    } catch {}
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadHistory();
  }, [isAuthenticated, loadHistory]);

  const triggerSOS = useCallback(async () => {
    if (activeMission) return;
    setAlertCountdown(ALERT_COUNTDOWN);
    let count = ALERT_COUNTDOWN;

    countdownRef.current = setInterval(async () => {
      count--;
      if (count <= 0) {
        clearInterval(countdownRef.current);
        setAlertCountdown(null);
        try {
          const pos = await getPosition(true);
          const mission = await api.createMission(pos.lat, pos.lng);
          setActiveMission(mission);
          setMissionRole('sender');
          showToast('Hilferuf gesendet! Helfer werden alarmiert.');
        } catch (err) {
          showToast(err.message || 'Hilferuf konnte nicht gesendet werden');
        }
      } else {
        setAlertCountdown(count);
      }
    }, 1000);
  }, [activeMission, getPosition, showToast]);

  const cancelSOS = useCallback(() => {
    clearInterval(countdownRef.current);
    setAlertCountdown(null);
  }, []);

  const acceptAlert = useCallback(async () => {
    if (!incomingAlert) return;
    clearTimeout(acceptRef.current);

    try {
      const pos = await getPosition(true).catch(() => null);
      const res = await api.respondToMission(
        incomingAlert.mission_id,
        'accepted',
        pos?.lat,
        pos?.lng
      );

      setActiveMission({
        id: incomingAlert.mission_id,
        sender_name: incomingAlert.sender_name,
        lat: res.precise_lat || incomingAlert.rough_lat,
        lng: res.precise_lng || incomingAlert.rough_lng,
        rough_lat: incomingAlert.rough_lat,
        rough_lng: incomingAlert.rough_lng,
        status: 'active',
        helpers_accepted: 1,
        created_at: incomingAlert.timestamp,
      });
      setMissionRole('helper');
      setIncomingAlert(null);
      setAcceptCountdown(null);

      // Open navigation
      const lat = res.precise_lat || incomingAlert.rough_lat;
      const lng = res.precise_lng || incomingAlert.rough_lng;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`,
        '_blank'
      );
    } catch (err) {
      showToast(err.message || 'Fehler beim Annehmen');
    }
  }, [incomingAlert, getPosition, showToast]);

  const declineAlert = useCallback(async () => {
    if (!incomingAlert) return;
    clearTimeout(acceptRef.current);
    try {
      await api.respondToMission(incomingAlert.mission_id, 'declined');
    } catch {}
    setIncomingAlert(null);
    setAcceptCountdown(null);
  }, [incomingAlert]);

  const endMission = useCallback(async () => {
    if (!activeMission) return;
    try {
      await api.endMission(activeMission.id);
      setActiveMission(null);
      setMissionRole(null);
      showToast('Einsatz beendet');
      loadHistory();
    } catch (err) {
      showToast(err.message || 'Fehler beim Beenden');
    }
  }, [activeMission, showToast, loadHistory]);

  const openNavigation = useCallback(() => {
    if (!activeMission) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${activeMission.lat},${activeMission.lng}&travelmode=walking`,
      '_blank'
    );
  }, [activeMission]);

  return (
    <MissionContext.Provider value={{
      activeMission, missionRole, alertCountdown, incomingAlert, acceptCountdown,
      history, toast,
      triggerSOS, cancelSOS, acceptAlert, declineAlert, endMission,
      openNavigation, loadHistory, showToast,
    }}>
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMission must be used within MissionProvider');
  return ctx;
}
