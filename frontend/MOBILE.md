# SocialHero – Mobile App (Capacitor)

Anleitung für iOS- und Android-Builds mit Capacitor.

## Voraussetzungen

- **iOS:** Mac mit Xcode, Apple Developer Account (99 €/Jahr)
- **Android:** Android Studio, Google Play Developer Account (25 € einmalig)
- **Firebase:** Für Push-Benachrichtigungen (FCM)

## API-URL für Native Builds

Native Apps benötigen **absolute URLs** für API und WebSocket. Beim Build müssen die Umgebungsvariablen gesetzt werden:

```bash
# Produktion (ersetze mit deiner API-Domain)
export VITE_API_URL=https://api.socialhero.de
export VITE_WS_URL=wss://api.socialhero.de

# Entwicklung auf Gerät (ersetze mit deiner lokalen IP)
export VITE_API_URL=http://192.168.1.100:8000
export VITE_WS_URL=ws://192.168.1.100:8000

npm run build
npx cap sync
```

## Build & Start

### Schnellstart (mit Standard-API-URL aus .env)

```bash
cd frontend
npm run cap:sync
npx cap open ios     # oder: npx cap open android
```

### Mit eigener API-URL

```bash
VITE_API_URL=https://api.socialhero.de VITE_WS_URL=wss://api.socialhero.de npm run cap:ios
# oder
VITE_API_URL=https://api.socialhero.de VITE_WS_URL=wss://api.socialhero.de npm run cap:android
```

## Firebase / Push-Benachrichtigungen

Für Push-Benachrichtigungen auf iOS und Android:

1. [Firebase Console](https://console.firebase.google.com/) → Projekt erstellen
2. **Android:** `google-services.json` nach `android/app/` kopieren
3. **iOS:** `GoogleService-Info.plist` in Xcode zum Projekt hinzufügen
4. Firebase Cloud Messaging aktivieren
5. Backend: `FCM_CREDENTIALS_JSON` in `.env` setzen (siehe DEPLOYMENT.md)

## iOS-spezifisch

- **Signing:** In Xcode → Signing & Capabilities → Team auswählen
- **Push:** Capability „Push Notifications“ hinzufügen
- **Background Modes:** Optional „Remote notifications“ für Hintergrund-Push

## Android-spezifisch

- **google-services.json** muss in `android/app/` liegen
- **minSdkVersion:** 22+ (für Geolocation)
- **Permissions:** Bereits in AndroidManifest.xml (Standort, Benachrichtigungen)

## NPM-Scripts

| Script | Beschreibung |
|--------|--------------|
| `npm run cap:sync` | Build + Sync zu iOS/Android |
| `npm run cap:ios` | Sync + Xcode öffnen |
| `npm run cap:android` | Sync + Android Studio öffnen |
| `npm run build:ios` | Mit VITE_* Env-Vars + iOS |
| `npm run build:android` | Mit VITE_* Env-Vars + Android |
