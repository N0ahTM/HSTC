# HSTC Plattform

Eine vollständig lauffähige Webplattform für die **Helvetic Security & Transport Corporation (HSTC)** mit Discord-Login, Mitgliederverwaltung, News-System, Eventplanung und Organisationsflotte.

## 🚀 Schnellstart

1. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```
2. **Datenbank initialisieren (optional, erstellt Demo-Daten)**
   ```bash
   npm run db:seed
   ```
3. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```
4. Die Seite ist anschließend unter [http://localhost:3000](http://localhost:3000) erreichbar.

## 🔐 Konfiguration

Leg in einer `.env`-Datei (Projektwurzel) die folgenden Variablen an:

```
DISCORD_CLIENT_ID=dein_discord_client_id
DISCORD_CLIENT_SECRET=dein_discord_client_secret
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback
DISCORD_WIDGET_GUILD=628996745837150211
SESSION_SECRET=ein_sicheres_sitzungsgeheimnis
HSTC_ADMIN_IDS=111111111111111111,222222222222222222
```

- `HSTC_ADMIN_IDS` enthält die Discord-IDs, die beim Login automatisch Administratorrechte erhalten (Komma-separiert).
- `DISCORD_WIDGET_GUILD` kann auf eine eigene Guild-ID angepasst werden, um Statistiken im Dashboard anzuzeigen.

## 🧩 Features

### Authentifizierung
- Discord OAuth2 Login inkl. Sessionverwaltung
- Automatische Profilerstellung und Aktualisierung bei jedem Login
- Adminsteuerung über `HSTC_ADMIN_IDS`

### Mitgliederprofil & Community
- Verpflichtender Ingame-Handle, frei wählbares Motto und Biografie
- Mehrfachauswahl für Einsatzbereiche (Pilot, PVP, Mining, usw.)
- Verwaltung der persönlichen Organisationsflotte inkl. Verfügbarkeit
- Automatische Aggregation aller Schiffe auf der öffentlichen Seite

### News & Kommunikation
- Öffentlicher Newsfeed
- Interner Newsfeed für eingeloggte Mitglieder
- Markdown-Unterstützung für News-Einträge
- Admin-Panel zur Veröffentlichung neuer Beiträge

### Events & Community-Features
- Eventübersicht mit Datum, Uhrzeit und Treffpunkt
- Admin-Panel zur Planung neuer Events
- Discord-Widget mit Live-Statistiken (Mitglieder online, Voice-Teilnehmer)

## 🗂 Projektstruktur

```
HSTC/
├── public/                 # Statische Assets & Frontend
│   ├── assets/css/main.css
│   ├── assets/js/app.js
│   └── index.html
├── server/                 # Express-Server & Routen
│   ├── index.js
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── utils/
├── scripts/                # Hilfsskripte (Build, Seed)
├── db/                     # SQLite-Datenbanken (wird automatisch erstellt)
├── package.json
└── README.md
```

## 🛡 Sicherheit & Datenschutz
- Sessions werden serverseitig in SQLite gespeichert (keine sensiblen Daten im Browser)
- Discord-Profile speichern nur Avatar, Discord-ID, Nutzername sowie freiwillig angegebene Orga-Daten
- Zugriff auf interne Daten (Mitglieder-News, Profilverwaltung) nur mit aktiver Discord-Session

## 🧪 Testen & Deployment
- `npm run dev` startet den Express-Server mit automatischem Reload (via nodemon)
- `npm run start` startet den Server ohne Reload (Production-Modus)
- `npm run build` erstellt eine statische Kopie der Frontend-Assets im `dist/`-Ordner

## 📄 Lizenz

© 2947–aktuelles Spieljahr (Realjahr + 930) Helvetic Security & Transport Corporation. Alle Rechte vorbehalten.
