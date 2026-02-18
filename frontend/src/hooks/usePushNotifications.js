import { useEffect, useRef } from 'react';
import { isNativePlatform } from '../utils/capacitor';
import api from '../services/api';

/**
 * Registriert Push-Benachrichtigungen und sendet den Token an das Backend.
 * Nur aktiv, wenn der Nutzer eingeloggt ist und die App nativ läuft.
 */
export function usePushNotifications(isAuthenticated) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !isNativePlatform()) return;
    if (registeredRef.current) return;

    let cancelled = false;

    async function registerPush() {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');

        const perm = await PushNotifications.checkPermissions();
        if (perm.receive !== 'granted' && perm.receive !== 'prompt') {
          const req = await PushNotifications.requestPermissions();
          if (req.receive !== 'granted') return;
        }

        await PushNotifications.register();
        registeredRef.current = true;
      } catch (err) {
        console.warn('[SocialHero] Push registration failed:', err);
      }
    }

    registerPush();

    const addListeners = async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');

        PushNotifications.addListener(
          'registration',
          async (token) => {
            if (cancelled) return;
            try {
              await api.updateFCMToken(token.value);
            } catch (err) {
              console.warn('[SocialHero] FCM token update failed:', err);
            }
          }
        );

        PushNotifications.addListener('registrationError', (err) => {
          console.warn('[SocialHero] Push registration error:', err);
        });

        PushNotifications.addListener(
          'pushNotificationReceived',
          (notification) => {
            console.log('[SocialHero] Push received:', notification);
          }
        );

        PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (action) => {
            console.log('[SocialHero] Push action:', action);
            // Optional: Navigation zu Mission bei Klick auf Benachrichtigung
          }
        );
      } catch (err) {
        console.warn('[SocialHero] Push listeners failed:', err);
      }
    };

    addListeners();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);
}
