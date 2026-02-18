/**
 * App-Konfiguration – API- und WebSocket-URLs
 *
 * Für native Apps (Capacitor) MÜSSEN absolute URLs gesetzt werden,
 * da relative URLs (z.B. /api/...) in capacitor://localhost nicht funktionieren.
 *
 * Build für Native mit API-URL:
 *   VITE_API_URL=https://api.socialhero.de VITE_WS_URL=wss://api.socialhero.de npm run build
 *
 * Entwicklung auf Gerät (ersetze mit deiner lokalen IP):
 *   VITE_API_URL=http://192.168.1.100:8000 VITE_WS_URL=ws://192.168.1.100:8000 npm run build
 */
export const API_URL = import.meta.env.VITE_API_URL || '';
export const WS_URL = import.meta.env.VITE_WS_URL || (
  typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
    : ''
);
