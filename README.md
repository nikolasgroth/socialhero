# SocialHero

**Dein Schutzschild in der Tasche** – SocialHero verbindet Menschen in Notsituationen mit hilfsbereiten Personen in der Nähe.

## Architektur

```
socialhero/
├── backend/          # Python FastAPI Backend
│   ├── app/
│   │   ├── api/      # REST + WebSocket Endpoints
│   │   ├── core/     # Config, Security, Dependencies
│   │   ├── models/   # SQLAlchemy Models
│   │   ├── schemas/  # Pydantic Schemas
│   │   └── services/ # Business Logic
│   ├── alembic/      # DB Migrations
│   ├── main.py       # Entry Point
│   └── requirements.txt
├── frontend/         # React (Vite) Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI Components
│   │   ├── pages/       # Route Pages
│   │   ├── hooks/       # Custom Hooks
│   │   ├── services/    # API Client
│   │   └── contexts/    # React Context Providers
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## Voraussetzungen

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ mit PostGIS
- Redis 7+

## Schnellstart

### 1. Mit Docker (empfohlen)

```bash
cp .env.example .env
# .env Datei anpassen (Secrets, DB credentials, etc.)
docker-compose up --build
```

Die App ist dann erreichbar unter:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 2. Manuell

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Umgebungsvariablen (.env)

| Variable | Beschreibung | Beispiel |
|---|---|---|
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql+asyncpg://user:pass@localhost:5432/socialhero` |
| `REDIS_URL` | Redis Connection String | `redis://localhost:6379/0` |
| `JWT_SECRET` | Secret für JWT Tokens | `dein-geheimes-secret-min-32-zeichen` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-xxx` |
| `APPLE_CLIENT_ID` | Apple Sign In Service ID | `com.socialhero.auth` |
| `APPLE_TEAM_ID` | Apple Developer Team ID | `XXXXXXXXXX` |
| `APPLE_KEY_ID` | Apple Sign In Key ID | `XXXXXXXXXX` |
| `APPLE_PRIVATE_KEY` | Apple Sign In Private Key (PEM) | (Inhalt der .p8 Datei) |
| `FCM_CREDENTIALS_JSON` | Firebase Cloud Messaging Credentials | (JSON String) |
| `ALERT_RADIUS_KM` | Alarmierungsradius in km | `1.0` |
| `ALERT_COUNTDOWN_SEC` | Countdown vor Alarmierung | `5` |
| `ACCEPT_TIMEOUT_SEC` | Zeit zum Annehmen eines Einsatzes | `30` |
| `CORS_ORIGINS` | Erlaubte CORS Origins | `http://localhost:5173` |

## Mobile App (iOS & Android)

SocialHero nutzt **Capacitor** für native iOS- und Android-Apps. Siehe **[frontend/MOBILE.md](frontend/MOBILE.md)** für:

- Build mit API-URL
- Firebase/Push-Einrichtung
- iOS- und Android-spezifische Schritte

```bash
cd frontend
VITE_API_URL=https://api.socialhero.de VITE_WS_URL=wss://api.socialhero.de npm run cap:ios
```

## Produktion

Für Produktions-Deployments und Beta-Tests siehe **[DEPLOYMENT.md](DEPLOYMENT.md)** – dort findest du:

- Pflicht-Checkliste (JWT_SECRET, CORS, DB-Passwort)
- SSL/HTTPS mit Let's Encrypt
- Firebase Push-Benachrichtigungen
- Rechtliche Seiten (Impressum, Datenschutz, AGB)

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```
