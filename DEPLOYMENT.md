# SocialHero – Deployment & Beta-Checkliste

Anleitung für den produktiven Betrieb und Beta-Tests.

## Vor dem ersten Start (Pflicht)

### 1. Secrets setzen

```bash
# JWT_SECRET generieren (mind. 32 Zeichen)
openssl rand -hex 32

# In .env eintragen:
JWT_SECRET=<generierter-wert>
```

**Wichtig:** Ohne sicheres `JWT_SECRET` startet das Backend in Produktion nicht.

### 2. Datenbank-Passwort ändern

In Produktion starke Passwörter für PostgreSQL verwenden:

```env
DATABASE_URL=postgresql+asyncpg://socialhero:DEIN_SICHERES_PASSWORT@db:5432/socialhero
```

### 3. CORS für deine Domain

```env
CORS_ORIGINS=https://app.socialhero.de,https://www.socialhero.de
```

### 4. Environment auf Produktion

```env
ENVIRONMENT=production
DEBUG=false
```

---

## SSL/HTTPS (für Beta empfohlen)

Geolocation im Browser funktioniert nur mit HTTPS (außer localhost).

### Option A: docker-compose.ssl.yml

1. In `frontend/nginx.prod.conf`: `REPLACE_WITH_DOMAIN` durch deine Domain ersetzen
2. Zertifikate mit certbot holen:

```bash
# Certbot auf dem Host (Port 80 muss frei sein)
sudo certbot certonly --standalone -d app.socialhero.de
```

3. In `docker-compose.ssl.yml` das Volume für Zertifikate einkommentieren:

```yaml
volumes:
  - ./frontend/nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

4. Starten:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d
```

### Option B: Reverse Proxy (Cloudflare, nginx, Traefik)

Wenn SSL von einem Proxy vor dem Container gehandhabt wird, reicht die Standard-`nginx.conf` (nur HTTP). Der Proxy leitet HTTPS weiter.

---

## Firebase Cloud Messaging (Push-Benachrichtigungen)

Ohne FCM erhalten Nutzer nur WebSocket-Benachrichtigungen (App muss geöffnet sein). Für echte Push-Alerts:

### Einrichtung

1. [Firebase Console](https://console.firebase.google.com/) → Projekt erstellen
2. Cloud Messaging aktivieren
3. **Projekteinstellungen** → **Service Accounts** → **Neuen privaten Schlüssel erstellen**
4. JSON-Datei herunterladen
5. Inhalt als einzeilige Zeichenkette in `.env`:

```env
FCM_CREDENTIALS_JSON={"type":"service_account","project_id":"...","private_key_id":"...",...}
```

**Hinweis:** Sonderzeichen im JSON müssen escaped werden. Alternativ: Base64-kodieren und im Backend dekodieren (erfordert Code-Anpassung).

### Web Push (PWA)

Für Web-Push in Browsern zusätzlich:
- Firebase Web Push-Zertifikate (VAPID Keys) konfigurieren
- Service Worker für Push-Registrierung

---

## Rechtliche Seiten (vor Beta prüfen)

Die Platzhalter-Seiten müssen mit echten Daten gefüllt werden:

- **Impressum** (`/impressum`): Firmenname, Adresse, Kontakt
- **Datenschutz** (`/datenschutz`): Verantwortlicher, Kontakt für DSGVO-Anfragen
- **Nutzungsbedingungen** (`/nutzungsbedingungen`): Gerichtsstand, Haftung

**Empfehlung:** Vor Veröffentlichung von einem Anwalt prüfen lassen.

---

## Produktion starten

```bash
# 1. .env prüfen (JWT_SECRET, CORS_ORIGINS, DATABASE_URL)
# 2. Starten
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Logs prüfen
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend
```

---

## Checkliste Beta-Start

- [ ] JWT_SECRET gesetzt (nicht Default)
- [ ] Datenbank-Passwort geändert
- [ ] CORS_ORIGINS enthält Produktions-Domain
- [ ] ENVIRONMENT=production, DEBUG=false
- [ ] SSL/HTTPS aktiv (für Geolocation)
- [ ] Impressum, Datenschutz, Nutzungsbedingungen ausgefüllt
- [ ] (Optional) FCM für Push-Benachrichtigungen
- [ ] Backup-Strategie für PostgreSQL
