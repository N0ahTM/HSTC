# HSTC Amplify Setup Guide

Diese Anleitung beschreibt die lokale Entwicklungsumgebung für die HSTC Plattform (Amplify Gen2 + React/Vite).

## 1. Voraussetzungen

- Node.js ≥ 18
- npm ≥ 9
- AWS CLI + Amplify CLI (`npm create amplify@latest`)
- Discord Application mit OAuth2 Credentials

## 2. Repository vorbereiten

```bash
npm install
```

## 3. Amplify Backend starten

```bash
npx ampx sandbox
```

> Die Sandbox erzeugt automatisch `amplify_outputs.json` (wird vom Frontend benötigt) und richtet lokale Resolver ein.

## 4. Secrets setzen (Discord OAuth)

```bash
npx ampx secret set DISCORD_CLIENT_ID 939491899226615808
npx ampx secret set DISCORD_CLIENT_SECRET NHBXzwOS-hxglb_FAQe6HROIu9_8znAu
```

Alternativ in der Amplify Console (Backend → Authentication → Environment variables).

## 5. Discord Provider konfigurieren

1. Amplify Console → Authentication → Identity Providers → **OpenID Connect**
2. Provider-Name `discord`
3. Client ID/Secret wie oben
4. Autorisierungs-URL `https://discord.com/api/oauth2/authorize`
5. Token-URL `https://discord.com/api/oauth2/token`
6. UserInfo-URL `https://discord.com/api/users/@me`
7. Scopes `identify email`
8. Redirect-URIs:
   - `https://hstc.space/?disidcallback=discord`
   - `https://<AMPLIFY-DOMAIN>/oauth2/idpresponse`
   - `http://localhost:5173/`

## 6. Frontend entwickeln

```bash
npm run dev
```

Bei erfolgreichem Login wird automatisch ein `Member`-Datensatz erstellt oder aktualisiert und mit dem Discord-Profil synchronisiert.

## 7. Deployment (Preview / Production)

```bash
# Preview / Development
npx ampx sandbox

# Production Deployment
npx ampx deploy
```

Nach `npx ampx deploy` werden Backend und Frontend in der Amplify Hosting Pipeline gebaut.

---

**Hinweis:** Adminrechte können über `Member.isAdmin` im Data-Backend oder per `.env`/`VITE_ADMIN_DISCORD_IDS` vergeben werden.
