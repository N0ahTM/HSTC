# HSTC Plattform (Amplify Edition)

Moderne Vollversion der **Helvetic Security & Transport Corporation** Plattform auf Basis von AWS Amplify (Gen2) und einem React/Vite Frontend. Enthält Discord-only Authentifizierung (über Cognito + OIDC), News- & Event-Verwaltung, Community-Profile mit Flottenfreigaben sowie Live-Discord-Widget.

## Schnellstart

1. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```
2. **Amplify Sandbox starten** (erstellt `amplify_outputs.json` für das Frontend)
   ```bash
   npx ampx sandbox
   ```
3. **Secrets hinterlegen** (Amplify Konsole oder `npx ampx secret set`)
   ```
   DISCORD_CLIENT_ID=939491899226615808
   DISCORD_CLIENT_SECRET=NHBXzwOS-hxglb_FAQe6HROIu9_8znAu
   ```
4. **Lokales Frontend starten**
   ```bash
   npm run dev
   ```
5. Seite aufrufen: [http://localhost:5173](http://localhost:5173)

> Ohne gültige `amplify_outputs.json` (oder laufende Sandbox) kann sich das Frontend nicht mit Cognito/AppSync verbinden. Die Datei wird bei `npx ampx sandbox` bzw. `amplify deploy` automatisch erzeugt.

## Amplify Backend

| Ressource | Beschreibung |
|-----------|--------------|
| `auth`    | Cognito User Pool mit Discord als OIDC Provider (Hosted UI). Custom Attributes speichern Discord ID, Avatar & Tag. |
| `data`    | Amplify Data Schema (`Member`, `Ship`, `NewsEntry`, `Event`, `DiscordWidgetCache`). Lesezugriff via API-Key, Schreibrechte für Besitzer/Admins. |
| `my-first-function` | Platzhalter-Lambda für optionale Automatisierungen (z. B. Cron-Jobs, Discord-Sync). |

### Discord & OIDC Setup

1. In der Discord Developer Console Redirect-URIs setzen:
   - `https://hstc.space/?disidcallback=discord`
   - `https://<AMPLIFY-DOMAIN>/oauth2/idpresponse`
   - `http://localhost:5173/`
2. In der Amplify Konsole unter *Authentication → Identity Providers → OpenID Connect* den Provider `discord` mit denselben Client-Daten anlegen.
3. Secrets für `DISCORD_CLIENT_ID` & `DISCORD_CLIENT_SECRET` in der Amplify Umgebung speichern.

## Frontend Architektur

- **Framework:** React 18 + Vite
- **State/Data:** AWS Amplify Data Client (`generateClient<Schema>()`)
- **Auth:** Amplify Hosted UI (Discord OIDC)
- **Styling:** Glas-/Neon-Design in Pure CSS
- **Markdown:** `marked` + `dompurify` für sichere Inhalte

### Features

- Discord Login mit automatischer Profilerstellung (Handle-Default, Avatar, Discord-ID)
- Mitgliederprofile inkl. Aktivitäten, Motto, Biografie & Flottenfreigaben
- Öffentliche & Mitglieder-News mit Markdown-Editor (nur Admins)
- Eventplanung mit Sichtbarkeitssteuerung
- Öffentliche Flottenübersicht + Member Directory
- Live Discord Widget (Widget-API, Fallback-Handling)

## Projektstruktur

```
HSTC/
├── amplify/               # Amplify Gen2 Backend (auth, data, function, storage)
├── public/                # Statische Assets (z. B. QR Code)
├── src/                   # React Komponenten, Styles, Amplify Client
├── index.html             # Vite Entry Point
├── package.json           # npm Scripts & Dependencies
└── tsconfig.json          # TypeScript Konfiguration
```

## Nützliche npm-Skripte

| Befehl | Beschreibung |
|--------|--------------|
| `npm run dev` | Lokaler Dev-Server (Vite) |
| `npm run build` | Produktionsbuild in `dist/` |
| `npm run preview` | Vorschau des Build-Artefakts |

## Deployment Hinweise

1. Lokale Sandbox testen: `npx ampx sandbox`
2. Änderungen committen & pushen: `git push`
3. Amplify CI/CD baut Backend & Frontend automatisch
4. Custom Domain `hstc.space` im Amplify Hosting verbinden

## Administrations-Notizen

- Adminrechte pro Mitglied (`Member.isAdmin`) lassen sich im Backend oder per Seed setzen.
- Zusätzlich können Discord-IDs im Frontend über `VITE_ADMIN_DISCORD_IDS` (kommagetrennt) Admin-Rechte erhalten.
- `DiscordWidgetCache` steht bereit, falls das Widget per Lambda gecached werden soll.

## Lizenz

© 2947–$gameYear Helvetic Security & Transport Corporation. Alle Rechte vorbehalten.
