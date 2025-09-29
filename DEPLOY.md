# HSTC Amplify Deployment Guide

## 1. Vorbereitungen

1. Sicherstellen, dass alle Secrets (Discord Client ID/Secret) gesetzt sind.
2. Optional: `VITE_ADMIN_DISCORD_IDS` in Amplify Environment Variables ergänzen.
3. Sandbox einmal laufen lassen, um `amplify_outputs.json` zu generieren und lokal zu testen.

```bash
npm install
npx ampx sandbox
npm run dev
```

## 2. CI/CD über Amplify

1. Änderungen committen (`git status` prüfen, anschließend `git commit` & `git push`).
2. Amplify Hosting löst automatisch einen Build aus:
   - Backend Synthese & Deployment
   - Frontend Build (`npm run build` via Vite)
   - Ausrollen auf die verbundene Domain (z. B. `hstc.space`)

## 3. Manuelles Deployment (Fallback)

```bash
# Backend & Hosting
npx ampx deploy
```

Bei Bedarf kann `--branch <name>` gesetzt werden, um eine Stage zu deployen.

## 4. Nach dem Deployment prüfen

- Login via Discord (Hosted UI Redirect)
- Öffentliche Seite (`/`) + Mitgliederfunktionen (News, Events, Profil)
- Fleet-Übersicht & Discord Widget
- Amplify Console → Monitoring (Logs/Lambda/Errors)

## 5. Rollback / Hotfix

- Git Revert auf vorherigen Commit
- `npx ampx deploy` erneut ausführen oder neuen Commit pushen
- Amplify behält alte Builds, sodass über die Hosting-Konsole ein Rollback möglich ist

---

**Tipp:** Für Staging-Umgebungen separate Amplify-Branches verwenden (z. B. `develop`, `preview`).
