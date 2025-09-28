# HSTC AWS Amplify Test Environment

Eine vollständige Test-Implementierung für AWS Amplify mit Authentifizierung, Datenmanagement, Lambda-Funktionen und Storage.

## 🚀 Schnellstart

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Amplify Backend initialisieren:**
   ```bash
   npm create amplify@latest
   ```

3. **Sandbox-Umgebung starten:**
   ```bash
   npx ampx sandbox
   ```

4. **Test-Website öffnen:**
   ```bash
   npm start
   ```

## 📋 Features

### 🔐 Authentifizierung
- Benutzerregistrierung mit E-Mail-Verifizierung
- Anmeldung/Abmeldung
- Passwort-Richtlinien
- Multi-Factor Authentication (optional)
- Benutzerdefinierte Attribute für HSTC-Piloten

### 📊 Datenmanagement
- **Pilot Profile:** Call Signs, Rollen, Schiffspräferenzen
- **Missions:** Kampf-, Transport-, Erkundungsmissionen
- **Ship Registry:** Flottenverwaltung und -status
- **Operations Log:** Mission- und Ereignisprotokolle
- **Announcements:** Organisationsnachrichten
- **Fleet Status:** Live-Flottenstatistiken

### ⚡ Lambda-Funktionen
- Mission Status Abfragen
- Pilot-Registrierung
- Flottenbericht-Generierung
- Discord-Integration
- Anpassbare Geschäftslogik

### 💾 Storage
- Hierarchische Dateispeicherung
- Rollenbasierte Zugriffskontrolle
- Mission Briefings und Berichte
- Pilot-spezifische Dateien
- Organisations-Assets

## 🧪 Testing Dashboard

Die Website enthält ein umfassendes Testing Dashboard mit:

- **Authentifizierung Tests:** Registrierung, Anmeldung, Benutzerverwaltung
- **Daten-API Tests:** CRUD-Operationen für alle Modelle
- **Funktions-Tests:** Lambda-Funktion Ausführung und Überwachung
- **Storage Tests:** Datei-Upload, -Download und -Verwaltung
- **System Status:** Live-Überwachung aller Services
- **Live Data:** Echzeit-Updates und Statistiken

## 📁 Projektstruktur

```
HSTC/
├── amplify/
│   ├── auth/
│   │   └── resource.ts          # Authentifizierungskonfiguration
│   ├── data/
│   │   └── resource.ts          # GraphQL Schema und Modelle
│   ├── storage/
│   │   └── resource.ts          # S3 Storage Konfiguration
│   ├── my-first-function/
│   │   ├── resource.ts          # Lambda-Funktionsdefinition
│   │   └── handler.ts           # Lambda-Handler-Code
│   └── backend.ts               # Backend-Konfiguration
├── index.html                   # Test-Website mit integriertem Dashboard
├── package.json                 # Abhängigkeiten und Scripts
└── README.md                    # Diese Datei
```

## 🛠 Entwicklung

### Amplify Sandbox
```bash
npx ampx sandbox
```
Startet eine lokale Entwicklungsumgebung mit Hot-Reload für Backend-Änderungen.

### Production Deploy
```bash
npx ampx deploy
```
Deployed das Backend in die AWS-Cloud.

### Git Integration
```bash
git add .
git commit -m "Update backend configuration"
git push
```
Löst automatisch CI/CD-Builds aus.

## 🔧 Konfiguration

### Authentifizierung
- **E-Mail-Verifizierung:** Aktiviert mit benutzerdefinierten Nachrichten
- **Passwort-Richtlinie:** Mindestens 8 Zeichen, Groß-/Kleinschreibung, Zahlen
- **MFA:** Optional mit TOTP-Support
- **Benutzerdefinierte Attribute:** Organisation Role, Pilot Call Sign, Join Date, etc.

### Daten-Schema
- **Pilot:** Vollständige Pilotprofile mit Statistiken
- **Mission:** Verschiedene Missionstypen und Status
- **Ship:** Flottenregistry mit Wartungsstatus
- **OperationLog:** Detaillierte Ereignisprotokolle
- **Announcement:** Organisationskommunikation
- **FleetStatus:** Aggregierte Flottenstatistiken

### Storage-Bereiche
- **public/:** Öffentlich zugängliche Dateien
- **missions/:** Missionsbriefings und -berichte
- **pilots/{id}/:** Pilot-spezifische private Dateien
- **fleet/:** Schiffsdokumentation
- **admin/:** Administrative Dateien (nur Admins)

### Lambda-Funktionen
- Verarbeitung von Geschäftslogik
- Integration mit externen APIs (Discord, etc.)
- Automatisierte Berichte und Benachrichtigungen
- Datenvalidierung und -transformation

## 🎯 Testing

### Manuelle Tests
1. Öffnen Sie `index.html` in einem Browser
2. Verwenden Sie das Testing Dashboard
3. Testen Sie alle Module einzeln
4. Führen Sie den Volltest aus

### Automatisierte Tests
```bash
npm run test
```

### Service-Überwachung
Das Dashboard bietet Live-Überwachung für:
- Backend-Verfügbarkeit
- Authentifizierungsservice
- GraphQL API
- S3 Storage
- Lambda-Funktionen

## 📈 Überwachung

### Live-Updates
- Online-Pilotenanzahl
- Aktive Missionen
- Flottenstatus
- Systemlast

### Logging
- Alle API-Aufrufe werden protokolliert
- Fehler werden im Dashboard angezeigt
- Performance-Metriken werden erfasst

## 🔒 Sicherheit

### Autorisierung
- Rollenbasierte Zugriffskontrolle (RBAC)
- Gruppen: Admins, Officers, Members, Recruits
- Ressourcen-spezifische Berechtigungen
- Owner-basierte Zugriffskontrolle

### Daten-Schutz
- Verschlüsselte Datenübertragung (HTTPS)
- Sichere Authentifizierung (AWS Cognito)
- Daten-Isolation zwischen Benutzern
- Audit-Logs für alle Aktionen

## 📞 Support

Bei Fragen oder Problemen:
1. Überprüfen Sie das Testing Dashboard auf Fehlermeldungen
2. Konsultieren Sie die [AWS Amplify Dokumentation](https://docs.amplify.aws/)
3. Kontaktieren Sie das HSTC-Entwicklerteam

## 📄 Lizenz

© 2947-3025 Helvetic Security & Transport Corporation