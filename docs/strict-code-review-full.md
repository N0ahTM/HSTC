# Strict Full Repository Code Review

Datum: 2026-05-24  
Repository: `HSTC-1`  
Scope: Voll-Review ueber Backend, Frontend, Build/Deploy, Scripts, Config, Docs und statische Assets.

## Methodik

- Vollstaendiger Repo-Scan mit Dateiinventur, manueller Deep-Dive auf Kernpfade und mehrfachem Subagent-Review.
- Runtime/Qualitaets-Checks ausgefuehrt: `npm run lint`, `npm run build`.
- Findings sind nach Schweregrad priorisiert.
- Fokus auf reale Risiken: Security, Deploy-Stabilitaet, Datenkonsistenz, A11y, Betriebsfaehigkeit.

## Critical Findings

1. **Unprotected public Lambda Function URL with wildcard CORS**
   - Datei: `amplify/backend.ts`
   - Problem: `FunctionUrlAuthType.NONE` plus `allowedOrigins: ['*']` exponiert den Discord-Aggregator oeffentlich.
   - Risiko: Missbrauch, Rate-Limit-Exhaustion, unnoetige Kosten, instabile API.
   - Fix: IAM/API-Gateway/WAF davor; CORS mindestens auf produktive Origins begrenzen.

2. **Secret handling can inline plaintext env values into deployed function config**
   - Datei: `amplify/backend.ts`
   - Problem: `process.env.DISCORD_* ? process.env : secret(...)`.
   - Risiko: Wenn Build-Umgebungsvariablen gesetzt sind, landen Werte als Klartext in Function-Environment/CloudFormation.
   - Fix: Fuer diese Keys immer `secret('...')` erzwingen und Build failen, wenn Klartext-Env gesetzt ist.

3. **Node typecheck config references deleted function path**
   - Datei: `tsconfig.node.json`
   - Problem: Enthalten ist `amplify/functions/discord-images/handler.ts`, diese Datei existiert nicht.
   - Risiko: Build/Typecheck-Instabilitaet, falsche Entwicklerdiagnosen.
   - Fix: Pfad auf `amplify/functions/discord-aggregate/handler.ts` korrigieren.

4. **Core architecture docs are materially incorrect**
   - Dateien: `README.md`, `amplify/README.md`, `docs/architecture.md`, `docs/amplify-gen2-integration.md`
   - Problem: Beschreibt Cognito/AppSync/Data/Storage-Struktur, die im Repo nicht existiert.
   - Risiko: Falsche Security-/Betriebsannahmen, fehlerhafte Onboarding- und Incident-Prozesse.
   - Fix: Dokumentation auf reale Architektur (Discord Aggregate Lambda + Hosting) umschreiben.

## High Findings

1. **Global redirect mutation in every CI build (branch race / config clobber risk)**
   - Dateien: `amplify.yml`, `scripts/apply-amplify-redirects.mjs`
   - Problem: `aws amplify update-app` wird im `postBuild` jedes Builds ausgefuehrt.
   - Risiko: Branch-Builds koennen app-weite Rewrites ueberschreiben; Race-Conditions zwischen parallelen Builds.
   - Fix: Nur auf Produktionsbranch ausfuehren; idempotenten Vergleich vor Write; alternativ einmalig IaC/Console-verwaltet.

2. **Redirect update hard-fails deployment**
   - Datei: `scripts/apply-amplify-redirects.mjs`
   - Problem: Bei CLI-Fehlern `process.exit(1)`.
   - Risiko: Frontend-Deploy faellt wegen externer CLI/API-Probleme aus.
   - Fix: fail-soft mit Alerting oder strikt branch-gated; mindestens bessere Pre-Validation + Retry.

3. **Major doc/script drift around obsolete `discord-images` function**
   - Dateien: `docs/discord-images-function-setup.md`, `docs/aws-cli-und-sandbox-setup.md`, `scripts/test-discord-events-function.ts`, `scripts/list-discord-events.ts`
   - Problem: Verweise auf alte Handler, Endpoints, Query-Shape und Secrets.
   - Risiko: Devs testen/bedienen falsche Routen und erhalten irrefuehrende Resultate.
   - Fix: Alle Referenzen auf `discord-aggregate` und `/api/discord-combined` migrieren.

4. **Missing third required secret in setup docs**
   - Dateien: `docs/aws-cli-und-sandbox-setup.md`, `docs/discord-images-function-setup.md`
   - Problem: Dokumentiert nur Bot token + channel id, aber `DISCORD_GUILD_ID` ist ebenfalls erforderlich.
   - Risiko: Events-Modus liefert 500 in neuen Umgebungen.
   - Fix: Secret-Matrix in allen relevanten Docs vereinheitlichen.

5. **Public debug surface leaks backend failure details**
   - Datei: `amplify/functions/discord-aggregate/handler.ts`
   - Problem: `debug=1` kann Fehlerdetails (`failingStatus`, `failingBodySnippet`) preisgeben.
   - Risiko: Informationsleck fuer externe Caller.
   - Fix: Debug in Produktion deaktivieren oder authentisieren.

6. **Manifest generation leaks local machine paths**
   - Dateien: `public/images/_manifest.json`, `scripts/optimize_images.py`
   - Problem: Manifest nutzt absolute Windows-Pfade.
   - Risiko: Entwicklerpfad-Leak, fragiler Tooling-Input.
   - Fix: Manifest auf web-relative `/images/...` normalisieren und CI-validieren.

7. **Vite env typing incomplete**
   - Datei: `src/vite-env.d.ts`
   - Problem: Nur `VITE_DISCORD_WIDGET_URL` typisiert; weitere verwendete Variablen fehlen.
   - Risiko: Tippfehler/Fehlkonfig unentdeckt zur Compile-Zeit.
   - Fix: Alle genutzten `VITE_*` Schluessel deklarieren.

8. **Lint pipeline currently red**
   - Dateien: `src/components/ResponsiveImage.tsx`, `src/components/SpaceBackground.tsx`
   - Problem: Aktive ESLint-Errors (u.a. `no-explicit-any`, `prefer-const`).
   - Risiko: Qualitaetsgate instabil vor Merge.
   - Fix: Lintfehler bereinigen; optional strictere CI-Gates fuer Node/Scripts erweitern.

## Medium Findings

1. **Frontend data-race risks in Discord provider**
   - Datei: `src/providers/DiscordDataProvider.tsx`
   - Problem: `loadInitial` und `loadMoreImages` koennen stale responses mischen (fehlende Request-Generation-Gates).
   - Risiko: Inkonsistente Bild/Event-States nach Refresh/Pagination.
   - Fix: Request-ID-Guard und konsistente Abort-Strategie fuer beide Flows.

2. **Duplicate Discord widget polling from multiple hook consumers**
   - Dateien: `src/hooks/useDiscordStats.ts`, `src/sections/HeroSection.tsx`, `src/sections/JoinSection.tsx`
   - Problem: Hook wird mehrfach instanziiert, jeweils mit eigenem Timer/Fetch.
   - Risiko: Unnoetige API-Last, inkonsistente Loading-States.
   - Fix: Shared Provider fuer Stats.

3. **A11y issue: hidden controls subtree in images section**
   - Datei: `src/sections/CommunityImagesSection.tsx`
   - Problem: Steuerung mit `aria-hidden` umschliesst interactive buttons.
   - Risiko: Assistive Tech kann Controls nicht erreichen.
   - Fix: `aria-hidden` entfernen/neu strukturieren.

4. **A11y issue: lightbox lacks full modal behavior**
   - Datei: `src/sections/CommunityImagesSection.tsx`
   - Problem: Kein Focus Trap, Hintergrund nicht inert.
   - Risiko: Keyboard/Screenreader Navigation springt hinter Modal.
   - Fix: Modal-Focus-Management + Background Locking.

5. **Lazy visible sections can stay unrendered without IntersectionObserver**
   - Datei: `src/App.tsx`
   - Problem: Keine robuste Fallback-Renderlogik bei fehlendem IO.
   - Risiko: Inhalte bleiben auf Placeholders.
   - Fix: `setShouldRender(true)` als Fallback bei fehlendem IO.

6. **No runtime payload validation for combined API responses**
   - Datei: `src/providers/DiscordDataProvider.tsx`
   - Problem: Blindes Casten von JSON auf interne Typen.
   - Risiko: Runtime-Fehler bei unerwarteten/malformierten Antworten.
   - Fix: Schema-Validation (z.B. Zod/Valibot) vor State-Update.

7. **Route/cache/header policy still operationally fragile**
   - Dateien: `amplify-redirects.json`, `customHttp.yml`
   - Problem: Mehrere SPA-Catchalls, `403` Mapping mit `200`, pauschales `/*` Caching.
   - Risiko: Soft-404/Status-Verlust, Cache-Artefakte nach Deploy.
   - Fix: Regelwerk vereinfachen, Statuscodes korrekt setzen, HTML separat no-cache behandeln.

8. **HSTS preload set without explicit readiness proof**
   - Datei: `customHttp.yml`
   - Problem: `preload` gesetzt.
   - Risiko: Schwer rueckgaengig bei Subdomain-/TLS-Ausnahmen.
   - Fix: preload erst nach kompletter Subdomain-Auditierung und bewusstem Preload-Submission-Prozess.

9. **ESLint configuration duplication/conflict risk**
   - Dateien: `.eslintrc.cjs`, `eslint.config.js`
   - Problem: Zwei parallel existierende ESLint-Konfigs mit abweichenden Presets.
   - Risiko: Uneinheitliche lint outcomes je Toolchain.
   - Fix: Auf Flat Config konsolidieren, Legacy-Konfig entfernen.

10. **VSCode workspace config is stale/noisy**
    - Dateien: `.vscode/settings.json`, `.vscode/tasks.json`, `.vscode/launch.json`
    - Problem: Fremde `dotnet` Solution, doppelte Task-Labels, leere Launch-Konfig.
    - Risiko: Schlechte Dev-UX, unklare Standard-Tasks.
    - Fix: Auf Projektrealitaet bereinigen.

11. **`scripts/local-function-server.ts` uses unrelated AppSync URL as base**
    - Datei: `scripts/local-function-server.ts`
    - Problem: URL-Base zeigt auf fremde AppSync Domain statt localhost-Basis.
    - Risiko: Irrefuehrung, potenzielle Nebenwirkungen bei Path/Origin-Logik.
    - Fix: `http://localhost:${PORT}` als base URL verwenden.

12. **Security-related account details committed in setup documentation**
    - Datei: `docs/aws-cli-und-sandbox-setup.md`
    - Problem: AWS SSO Start URL + Account ID + Admin-Rolle als konkrete Werte.
    - Risiko: Operative Informationen zu breit exponiert.
    - Fix: Platzhalter + least-privilege guidance.

## Low Findings

1. **`amplify_outputs.json` operational drift risk**
   - Dateien: `amplify_outputs.example.json`, `src/config/amplifyOutputs.ts`, `vite.config.ts`
   - Problem: Endpoint wird buildseitig stark gecacht/gebunden.
   - Risiko: Nach Backend-Rotation ist Frontend ggf. stale bis Rebuild/Reload.
   - Fix: klarer Runtime-Refresh-Mechanismus oder stricte env-driven endpoint source.

2. **Duplicate/inactive components and code paths increase maintenance surface**
   - Beispiele: `src/sections/DiscordSection.tsx`, `src/sections/OperationsSection.tsx`, `src/components/ScrollProgress.tsx`, `src/components/StatsFlashWrapper.tsx`
   - Problem: Inaktive Pfade driften.
   - Fix: Entfernen oder aktiv integrieren + Tests.

3. **No automated test files present despite test tooling**
   - Scope: gesamtes Repo (`*.test.*`/`*.spec.*` nicht vorhanden)
   - Problem: Hohe Regressionswahrscheinlichkeit bei Refactors.
   - Fix: Minimum-Suite fuer Provider-Races, Routing/IO-Fallback, Accessibility-Interaktionen.

4. **Formatting/doc quality issues**
   - Beispiel: `docs/animation-features.md` (Encoding-Artefakte), uneinheitliche Aussagen in mehreren Docs.
   - Risiko: Missverstaendnisse und Setup-Fehler.
   - Fix: UTF-8 cleanup + konsolidierte Dokuquelle.

## Bereits zuvor identifizierte (und hier bestaetigte) Kernprobleme

- Branch-uebergreifendes Redirect-Update via CI.
- Hard-fail im Redirect-Apply-Script.
- Fragile `amplify_outputs`/endpoint Kopplung.
- Inkomplette Env-/Runtime-Absicherung.
- Aktuelle Lint-Fehler in produktivem Source.

## Verifikationsergebnisse (aktueller Stand)

- `npm run build`: **OK**
- `npm run lint`: **FAIL** (mehrere Errors)

## Zweiter Voll-Durchgang (Abdeckung erweitert)

Nach dem Nachreview wurden auch die zuvor nicht explizit dokumentierten Randdateien geprueft:

- `.gitignore`
- `.prettierrc`
- `public/_headers`
- `src/types/global.d.ts`

Zusatz: Es wurde eine komplette Coverage-Matrix ueber alle getrackten Dateien erstellt.

- Getrackte Dateien gesamt: **298**
- Text-/Konfig-/Code-Dateien (voll inhaltlich reviewbar): **106**
- Binary/static assets (Bilder, komprimierte Artefakte): **192**

Status:

- **106/106 text-like Dateien** wurden in den zwei Review-Runden inhaltlich geprueft.
- Binary/static assets wurden auf **Pipeline-/Referenz-/Konfig-Risiken** geprueft (nicht pixelweise manuell dekompiliert, da technisch nicht sinnvoll).

## Zusaetzliche Findings aus dem erweiterten Durchgang

1. **Critical: Absolute lokale Pfade in oeffentlich ausgeliefertem Bild-Manifest**
   - Datei: `public/images/_manifest.json`
   - Problem: Manifest enthaelt absolute Windows-Entwicklerpfade (`C:/Users/...`) in Keys und `src`.
   - Risiko: Informationsleck (lokale Pfadstruktur), fragiles Manifest fuer Tooling.
   - Fix: Manifest-Erzeugung auf web-relative `/images/...`-Pfade umstellen; CI-Pruefung gegen absolute Pfade.

2. **High: Platzhalter-Hoehe in Lazy Sections wird nicht angewendet (CLS-Risiko)**
   - Dateien: `src/App.tsx`, `src/styles/global.css`
   - Problem: `minHeight` wird als `data-minheight` gesetzt, aber CSS nutzt es nicht.
   - Risiko: Layout Shift beim Nachladen der Sections.
   - Fix: `style={{ minHeight }}` direkt setzen oder CSS-konforme Loesung verwenden.

3. **High: Dreifaches Polling fuer Discord-Stats**
   - Dateien: `src/hooks/useDiscordStats.ts`, `src/sections/HeroSection.tsx`, `src/sections/JoinSection.tsx`, `src/sections/DiscordSection.tsx`
   - Problem: Mehrfache Hook-Instanzen triggern redundante Polling-Requests.
   - Risiko: unnoetige Last, inkonsistente Anzeige.
   - Fix: Shared Stats Provider / zentraler Fetch.

4. **High: Carousel-Controls per `aria-hidden` fuer Screenreader versteckt**
   - Datei: `src/sections/CommunityImagesSection.tsx`
   - Problem: Interaktive Buttons liegen in einem `aria-hidden`-Container.
   - Risiko: Accessibility-Break fuer assistive Technologien.
   - Fix: `aria-hidden` an der Controls-Wrapper-Struktur entfernen/anpassen.

5. **High: Unsicherer Zugriff auf optionale API-Felder in Provider**
   - Datei: `src/providers/DiscordDataProvider.tsx`
   - Problem: Stellenweise optional chaining ohne vollstaendige Guarding-Logik bei Arrays/Feldern.
   - Risiko: Runtime-Throws bei teilweisen/malformierten Payloads.
   - Fix: harte Shape-Validation und defensive `?.`-/Array-Pruefungen.

6. **Medium: Konflikt zwischen immutable Image-Caching und Manifest-Aktualisierung**
   - Dateien: `customHttp.yml`, `public/_headers`
   - Problem: `/images/*` auf `immutable` kann auch Manifest-/nicht-gehashte Dateien zu aggressiv cachen.
   - Risiko: Clients sehen veraltete Manifestdaten.
   - Fix: separate Regel fuer `/_manifest.json` (kurzer TTL/no-cache).

## Priorisierte Maßnahmen (empfohlen)

1. Security/Betrieb absichern: Function URL Auth + CORS + branch-safe Redirect-Deployment.
2. Build/Typecheck fixen: `tsconfig.node.json` korrigieren, stale scripts/docs auf `discord-aggregate` migrieren.
3. Frontend-Datenfluss stabilisieren: Request race guards + shared Discord stats provider.
4. Doku auf Ist-Stand bringen: Architektur/Setup konsistent und reproduzierbar machen.
5. Quality-Gates: Lint gruen, baseline tests fuer kritische Hooks/Provider.

## Execution Status Board

`WS | Owner | Branch | LastUpdateUTC | Progress% | State | Next | Blocker`

- `WS1 | Agent-A | ws1-security | 2026-05-24T18:14:00Z | 90 | in_review | Optional IAM/API-GW Hardening entscheiden | Function URL bleibt bewusst public`
- `WS2 | Agent-B | ws2-build | 2026-05-24T18:14:00Z | 100 | done | In Gate C verifizieren | -`
- `WS3 | Agent-C | ws3-data | 2026-05-24T18:14:00Z | 100 | done | Observability nachziehen (optional) | -`
- `WS4 | Agent-D | ws4-a11y | 2026-05-24T18:14:00Z | 100 | done | Optional modal abstraction | -`
- `WS5 | Agent-E | ws5-docs | 2026-05-24T18:14:00Z | 100 | done | Doku-Review im Team | -`
- `WS6 | Agent-F | ws6-assets | 2026-05-24T18:14:00Z | 100 | done | Live Header rollout prüfen | -`

## Closure Report

### Gate A

- AWS Sanity: `aws sts get-caller-identity` **OK**
- Amplify App Read: `aws amplify get-app --app-id d2try42du56ucd` **OK**
- Build/Deploy Schutzmaßnahmen umgesetzt:
  - branch-gated Redirect-Update
  - redirect JSON validation + idempotence check + non-strict fail-soft mode
  - `amplify_outputs.json` validation in `amplify.yml`
  - `tsconfig.node.json` korrigiert

### Gate B

- Frontend correctness/a11y umgesetzt:
  - Race-Guard + defensive response normalization in `DiscordDataProvider`
  - dedupliziertes Discord stats polling in `useDiscordStats`
  - `aria-hidden` Fix + Lightbox focus trap + restore focus
  - IO fallback + CLS placeholder min-height fix in `App`

### Gate C

- `npm run lint` **OK**
- `npm run build` **OK**
- `npm run lint:infra` **OK** (nur Hinweis von baseline-browser-mapping Update-Reminder)
- Live smoke checks:
  - `/discord` -> **302** auf Discord (fix live)
  - `/join` -> **302** auf RSI (fix live)
  - `/amplify_outputs.json` -> weiterhin **404** (statisches Site-Artefakt noch nicht mit lokalen Änderungen ausgerollt)
  - `/images/_manifest.json` -> `Cache-Control: no-cache, max-age=0, must-revalidate` (fix live)
  - Security headers (`HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) auf Responses sichtbar (fix live)

### Umgesetzte Kernänderungen (Dateien)

- Security/Infra:
  - `amplify/backend.ts`
  - `amplify/functions/discord-aggregate/handler.ts`
- Build/Deploy:
  - `amplify.yml`
  - `scripts/apply-amplify-redirects.mjs`
  - `tsconfig.node.json`
- Frontend data/a11y:
  - `src/providers/DiscordDataProvider.tsx`
  - `src/hooks/useDiscordStats.ts`
  - `src/sections/CommunityImagesSection.tsx`
  - `src/App.tsx`
- Assets/Caching:
  - `scripts/optimize_images.py`
  - `public/images/_manifest.json`
  - `customHttp.yml`
  - `public/_headers`
  - `amplify-redirects.json`
- Docs/Tooling drift:
  - `README.md`
  - `amplify/README.md`
  - `docs/architecture.md`
  - `docs/amplify-gen2-integration.md`
  - `docs/aws-cli-und-sandbox-setup.md`
  - `docs/discord-images-function-setup.md`
  - `.vscode/{settings.json,tasks.json,launch.json}`
  - `scripts/{list-discord-events.ts,test-discord-events-function.ts,test-discord-function.ts,local-function-server.ts}`

### Restpunkt (accepted_defer)

- `FunctionUrlAuthType.NONE` wurde nicht auf IAM/API-Gateway umgestellt, um bestehende öffentliche Frontend-Aufrufe nicht zu brechen.
- Risiko wurde reduziert durch:
  - restriktivere CORS Origins
  - Entfernen von plaintext secret overrides
  - Debug-Details nur noch bei explizit gesetztem `ALLOW_PUBLIC_DEBUG_DETAILS=true`
- Amplify Full Deploy von lokalen Source-Änderungen ist ohne Push auf das verbundene Repository nicht möglich:
  - `ampx pipeline-deploy` verweigert lokale Ausführung (nur CI)
  - `create-deployment` ist für repository-connected Apps deaktiviert

