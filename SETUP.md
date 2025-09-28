# HSTC Amplify Test Environment - Setup Instructions

## Schritt-für-Schritt Anleitung

### 1. 🚀 Amplify Initialisierung

```bash
# Im Projektstamm ausführen
npm create amplify@latest
```

Wenn der `amplify/` Ordner bereits existiert, fahren Sie mit Schritt 2 fort.

### 2. 🔐 Authentifizierung einrichten

Die Authentifizierung ist bereits in `amplify/auth/resource.ts` konfiguriert:

- **E-Mail-basierte Anmeldung** mit Verifizierung
- **Benutzerdefinierte Attribute** für HSTC-Piloten:
  - `custom:organization_role`
  - `custom:pilot_call_sign` 
  - `custom:join_date`
  - `custom:ship_preference`
  - `custom:preferred_language`
- **Passwort-Richtlinien** (8+ Zeichen, Groß-/Kleinschreibung, Zahlen)
- **Optionale MFA** mit TOTP

**Testen:**
```bash
npx ampx sandbox
```

### 3. 📊 Datenmanager konfigurieren

Das GraphQL-Schema ist in `amplify/data/resource.ts` definiert:

**Modelle:**
- **Pilot**: Pilotprofile mit Call Signs, Rollen, Statistiken
- **Mission**: Kampf-, Transport-, Erkundungsmissionen
- **Ship**: Flottenregistry und Wartungsstatus
- **OperationLog**: Missions- und Ereignisprotokolle
- **Announcement**: Organisationsnachrichten
- **FleetStatus**: Live-Flottenstatistiken

**Autorisierung:**
- Rollenbasierte Zugriffskontrolle
- Owner-basierte Daten-Isolation
- Gruppen: `admins`, `officers`, `members`, `recruits`

### 4. ⚡ Lambda-Funktionen hinzufügen

Die erste Funktion ist bereits erstellt:

**Verzeichnisstruktur:**
```
amplify/my-first-function/
├── resource.ts    # Funktionsdefinition
└── handler.ts     # Handler-Code mit HSTC-spezifischer Logik
```

**Verfügbare Operationen:**
- `mission_status`: Missionsstatus abfragen
- `pilot_registration`: Pilot registrieren
- `fleet_report`: Flottenbericht generieren
- `discord_integration`: Discord-Integration testen

**Backend aktualisieren:**
Die Funktion ist bereits in `amplify/backend.ts` eingetragen.

### 5. 💾 Storage konfigurieren

S3 Storage ist in `amplify/storage/resource.ts` konfiguriert:

**Zugriffsbereiche:**
- `public/organization/*`: Öffentliche Organisationsdateien
- `public/images/*`: Öffentliche Bilder
- `public/documents/*`: Handbücher, Guides (nur Officers können schreiben)
- `missions/briefings/*`: Missionsbriefings (authentifizierte Benutzer)
- `pilots/{entity_id}/*`: Private Pilotdateien
- `fleet/ships/*`: Schiffsdokumentation
- `admin/*`: Administrative Dateien (nur Admins)

### 6. 🧪 Testing Interface

Die Test-Website (`index.html`) bietet:

**Testing Panels:**
1. **Authentifizierung**: Registrierung, Anmeldung, Benutzerverwaltung
2. **Datenmanager**: CRUD-Operationen für alle Modelle
3. **Lambda-Funktionen**: Funktionsausführung und -überwachung
4. **Storage**: Datei-Upload, -Download, -Verwaltung
5. **System Status**: Live-Service-Überwachung
6. **Live-Daten**: Echzeit-Updates und Statistiken

**Features:**
- 🎯 Drag & Drop Datei-Upload
- 📊 Live-Status-Überwachung
- 🔄 Automatische Service-Tests
- 📈 Echzeit-Daten-Updates
- 🛡️ Auth-Status-Anzeige

### 7. 🚦 Deployment

#### Sandbox (Entwicklung)
```bash
npx ampx sandbox
```
- Startet lokale Entwicklungsumgebung
- Hot-Reload für Backend-Änderungen
- Automatische Code-Generierung

#### Production Deploy
```bash
npx ampx deploy
```
- Deployed Backend in AWS Cloud
- Erstellt Production-Umgebung
- Generiert Amplify Outputs

#### Git Integration
```bash
git add .
git commit -m "Add Amplify backend"
git push
```
- Löst automatische CI/CD aus
- Backend wird in der Cloud bereitgestellt

### 8. 🔧 Konfiguration nach Deployment

Nach dem ersten Deploy:

1. **Amplify Outputs abrufen:**
   ```bash
   npx ampx generate outputs --format json
   ```

2. **Frontend mit Backend verbinden:**
   - Die generierte `amplify_outputs.json` in die Website einbinden
   - Amplify JavaScript SDK konfigurieren

3. **Benutzergruppen erstellen (AWS Console):**
   - `admins`: Vollzugriff auf alle Ressourcen
   - `officers`: Erweiterte Berechtigungen
   - `members`: Standardberechtigungen
   - `recruits`: Basiszugriff

### 9. 📋 Checkliste

- [ ] `npm install` ausgeführt
- [ ] `npx ampx sandbox` gestartet
- [ ] Authentifizierung getestet
- [ ] Datenmodelle erstellt
- [ ] Lambda-Funktionen getestet
- [ ] Storage-Upload getestet
- [ ] Alle Service-Status grün
- [ ] Production Deploy erfolgreich
- [ ] Benutzergruppen konfiguriert

### 10. 🎯 Erste Tests

1. **Website öffnen:** `index.html` in Browser
2. **System Status prüfen:** Alle Services sollten "Online" sein
3. **Authentifizierung testen:**
   - Benutzer registrieren
   - E-Mail verifizieren
   - Anmelden/Abmelden
4. **Daten erstellen:**
   - Pilot-Profil anlegen
   - Mission erstellen
   - Fleet Status abrufen
5. **Funktionen testen:**
   - Alle Lambda-Funktionen ausführen
6. **Storage testen:**
   - Datei hochladen
   - Dateien auflisten
   - Download testen
7. **Volltest ausführen:** Gesamtsystem prüfen

### 🔍 Troubleshooting

**Häufige Probleme:**

1. **"Module not found" Fehler:**
   ```bash
   npm install
   ```

2. **Sandbox startet nicht:**
   ```bash
   npx ampx sandbox --help
   npx ampx sandbox --debug
   ```

3. **Auth-Fehler:**
   - Überprüfen Sie die Cognito-Konfiguration
   - Verifizieren Sie E-Mail-Attribute

4. **API-Fehler:**
   - GraphQL-Schema überprüfen
   - Autorisierungsregeln prüfen

5. **Storage-Probleme:**
   - S3-Berechtigungen überprüfen
   - Pfad-Zugriffskontrolle verifizieren

### 📞 Weitere Hilfe

- **AWS Amplify Docs:** https://docs.amplify.aws/
- **HSTC Discord:** https://discord.gg/jV8rByuJ4G
- **GitHub Issues:** Für technische Probleme

---

**Ready to launch! 🚀 o7**