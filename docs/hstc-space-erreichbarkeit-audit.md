# hstc.space — Erreichbarkeits- & Sicherheits-Audit

**Datum:** 24. Mai 2026  
**Geprüfte Domain:** `https://hstc.space`  
**Prüfmethode:** Live-HTTP/DNS-Checks, Repo-Abgleich, öffentliche Reputation-Dienste

---

## Kurzfassung

| Bereich | Status |
|---|---|
| **Grund-Erreichbarkeit (HTTPS)** | ✅ OK — HTTP 200, ~115 ms (CloudFront HAM50-P6) |
| **DNS / Hosting** | ✅ OK — AWS CloudFront + S3 |
| **Static Assets (JS/CSS/Bilder)** | ✅ OK |
| **Discord Widget (Online/Voice)** | ✅ OK |
| **Discord Combined Lambda (Events/Bilder)** | ⚠️ Funktioniert, aber langsam (~2 s) |
| **Redirects `/discord`, `/join`** | ❌ Kaputt (404 statt 302) |
| **Amplify Redirect-Regeln** | ❌ Nicht aktiv deployed |
| **`amplify_outputs.json` in Production** | ❌ 404 |
| **Veralteter Preconnect (Lambda-URL)** | ⚠️ Alte URL liefert 403 |
| **Öffentliche Malware-Blocklists** | ✅ Kein Treffer gefunden |
| **G DATA Webschutz** | ⚠️ Nicht direkt prüfbar — False Positive möglich (siehe Abschnitt unten) |
| **Norton Safe Web** | ✅ Kein öffentlicher Threat-Hinweis |

**Fazit:** Die Seite ist technisch erreichbar und liefert Inhalte aus. Probleme betreffen vor allem **Hosting-Konfiguration (Redirects)**, **Backend-Binding** und möglicherweise **Antivirus-Reputation (G DATA)** wegen Domain-Historie.

---

## 1. Infrastruktur & Erreichbarkeit

### DNS

| Host | Auflösung |
|---|---|
| `hstc.space` | CloudFront (A/AAAA), z. B. `13.224.68.x`, `18.239.50.x` |
| `www.hstc.space` | CNAME → `*.cloudfront.net` |

### HTTP/HTTPS

| URL | Status | Anmerkung |
|---|---|---|
| `https://hstc.space/` | **200** | ~115 ms Gesamtzeit |
| `http://hstc.space/` | **301 → HTTPS** | Korrekt |
| `https://www.hstc.space/` | **200** | Kein Redirect auf Apex |
| `https://hstc.space/sitemap.xml` | **200** | OK |
| `https://hstc.space/robots.txt` | **200** | OK |
| `https://hstc.space/favicon.ico` | **404** | Favicon ist `/images/HSTC-Logo.webp` |
| `https://hstc.space/amplify_outputs.json` | **404** | Sollte deployed werden |

### Response-Header (Homepage)

- **Server:** AmazonS3 via CloudFront
- **Cache:** `X-Cache: Hit from cloudfront`
- **Alt-Svc:** HTTP/3 (`h3`) angeboten
- **Fehlt:** `Strict-Transport-Security`, CSP, `X-Frame-Options`, `X-Content-Type-Options`

### Assets (Production-Build)

| Resource | Status |
|---|---|
| `/assets/index-T1ZgDP9A.js` | **200**, gzip |
| `/assets/index-Bpoi3RKA.css` | **200** |
| `/images/HSTC-Logo.webp` | **200** |

### Hosting-Stack

```
Browser → CloudFront (Edge, z. B. HAM50-P6) → S3 (Amplify Hosting Build-Artefakte)
Backend: AWS Lambda Function URL (eu-central-1) für Discord Combined API
```

---

## 2. Funktionale Checks

### Discord Widget (Hero-Stats: Online / Voice)

- Endpoint: `https://discord.com/api/guilds/628996745837150211/widget.json`
- Status: **200** — Widget aktiv, `presence_count` verfügbar
- Implementierung: `src/hooks/useDiscordStats.ts`

### Discord Combined API (Events + Community-Bilder)

- **Aktuelle URL im JS-Bundle (Build-Artefakt):**  
  `https://lrm2pghvmx546sbazhbi2gi6q40wmbaw.lambda-url.eu-central-1.on.aws/`
- Status mit `?mode=both&limit=5`: **200** (~2,2 s Latenz)
- Lokal im Repo: `amplify_outputs.json` → gleiche URL

- **Veraltete URL im HTML-Preconnect:**  
  `https://57vwt24s5t3nxqs34gswrgmeaq0wkihq.lambda-url.eu-central-1.on.aws/` → **403**
- Ursache: Preconnect aus älterem Build, Lambda nach Redeploy nicht aktualisiert

### Externe Abhängigkeiten der Seite

Die Live-Seite kontaktiert u. a.:

- `discord.com` (Widget)
- `cdn.discordapp.com` (Bilder aus Lambda-Response)
- `*.lambda-url.eu-central-1.on.aws` (Backend)

---

## 3. Gefundene Probleme & Fixes

### 3.1 Redirects `/discord` und `/join` kaputt — **Priorität: Hoch**

**Symptom:**

```
GET /discord  → 301 /discord/  → 404
GET /join     → 301 /join/     → 404
```

**Erwartet** (laut `amplify-redirects.json`):

| Route | Ziel | Status |
|---|---|---|
| `/discord` | `https://discord.gg/jV8rByuJ4G` | 302 |
| `/join` | `https://robertsspaceindustries.com/orgs/HSTC` | 302 |

**Ursache:** `amplify-redirects.json` liegt im Repo, ist aber **nicht in Amplify Hosting aktiv** (kein `customHttp` in `amplify.yml`, keine Console-Konfiguration sichtbar).

**Fix:**

1. Amplify Console → **Hosting → Rewrites and redirects**
2. Regeln aus `amplify-redirects.json` importieren/konfigurieren  
   **oder** in Amplify Gen 2 `customHttp` einbinden
3. Deploy auslösen und testen:
   ```bash
   curl -I https://hstc.space/discord
   curl -I https://hstc.space/join
   ```

---

### 3.2 SPA-Fallback liefert HTTP 404 — **Priorität: Mittel**

**Symptom:** Unbekannte Routen (z. B. `/discord/`) liefern zwar `index.html`-Inhalt, aber HTTP-Status **404**.

**Ursache:** Catch-all-Regel aus `amplify-redirects.json` nicht deployed:

```json
{
  "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|jpeg|js|png|txt|svg|webp|woff|woff2|ttf|map|json)$)([^.]+$)/>",
  "target": "/index.html",
  "status": "200"
}
```

**Fix:** Gleiche Redirect-Deployment-Maßnahme wie in 3.1.

---

### 3.3 `amplify_outputs.json` fehlt in Production — **Priorität: Hoch**

**Symptom:** `https://hstc.space/amplify_outputs.json` → **404**

**Auswirkung:** Runtime-Fallback in `src/config/amplifyOutputs.ts` schlägt fehl. Aktuell funktioniert es nur, weil die Lambda-URL **beim Build ins JS-Bundle eingebettet** ist. Nach Backend-Redeploy ohne Frontend-Rebuild bricht die Discord-Datenanbindung.

**Fix (eine Option wählen):**

1. `amplify_outputs.json` beim Build nach `dist/` kopieren und mit deployen
2. Amplify-Umgebungsvariable `VITE_DISCORD_COMBINED_ENDPOINT` setzen
3. Amplify Gen 2 so konfigurieren, dass `amplify_outputs.json` automatisch im Hosting-Artefakt landet

**Aktueller lokaler Stand:**

```json
{
  "version": "1.4",
  "custom": {
    "discordCombinedUrl": "https://lrm2pghvmx546sbazhbi2gi6q40wmbaw.lambda-url.eu-central-1.on.aws/"
  }
}
```

---

### 3.4 Veralteter Lambda-Preconnect — **Priorität: Mittel**

**Symptom:** Ausgelieferte `index.html` enthält:

```html
<link rel="preconnect" href="https://57vwt24s5t3nxqs34gswrgmeaq0wkihq.lambda-url.eu-central-1.on.aws" crossorigin />
```

Diese URL antwortet mit **403**. Die korrekte URL steht im JS-Bundle.

**Fix:**

- Preconnect entfernen **oder** dynamisch aus `amplify_outputs.json` beim Build setzen
- Nach jedem Backend-Redeploy Frontend neu bauen und deployen

---

### 3.5 Security-Header fehlen — **Priorität: Mittel**

**Symptom:** Kein HSTS, kein CSP, kein `X-Content-Type-Options`.

**Fix:** In Amplify Custom Headers (Beispiel):

```json
{
  "customHeaders": [
    {
      "pattern": "**/*",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

### 3.6 Kleinere Punkte — **Priorität: Niedrig**

| Problem | Impact | Fix |
|---|---|---|
| `/favicon.ico` → 404 | Gering | `favicon.ico` in `public/` ablegen |
| `www` und Apex beide 200 | Duplicate Content (SEO) | 301 von `www` → `hstc.space` |
| `/index.html` → 200 statt 301 | Gering (SEO) | Redirect-Regel deployen |
| Lambda API ~2 s Latenz | Mobile LCP leidet | Caching, Edge-Proxy, statischer Fallback |
| React `fetchPriority`-Warning | Console-Warnung | Bereits in `ResponsiveImage.tsx` adressiert |

---

## 4. Performance (Lighthouse-Hinweis)

Vorhandene Reports unter `Lighhouse Reports/` stammen von **localhost**, nicht von Production.

| Metrik | Desktop (localhost) | Mobile (localhost) |
|---|---|---|
| Performance | 82 | 59 |
| Accessibility | 94 | 96 |
| Best Practices | 96 | 96 |
| SEO | 100 | 100 |
| LCP | 2,7 s | 14,3 s (Lambda-Kette!) |

**Empfehlung:** Lighthouse erneut gegen `https://hstc.space` laufen lassen (PageSpeed Insights).

---

## 5. Browser-Kompatibilität

| Browser | Erwartung |
|---|---|
| Chrome / Edge / Firefox / Safari (aktuell) | ✅ Sollte funktionieren |
| Safari iOS / Chrome Android | ✅ Funktioniert, Lambda-Latenz spürbar |
| IE11 | ❌ Nicht unterstützt (Build-Target ES2020) |
| JavaScript deaktiviert | ❌ Nur leeres `<div id="root">` |

Cross-Browser-Probleme sind unwahrscheinlich — eher Infrastruktur (Redirects, API, Performance).

---

## 6. Sicherheits-Reputation & Antivirus-Checks

### 6.1 Öffentlich prüfbare Blocklists

| Dienst | Ergebnis für `hstc.space` | Anmerkung |
|---|---|---|
| **URLhaus (DNS)** | ✅ Kein Treffer | `hstc.space.urlhaus.abuse.ch` → NXDOMAIN |
| **Google Safe Browsing** | ✅ Kein Hinweis auf Malware/Phishing | Transparency Report ohne Warnung |
| **PhishTank** | ⚠️ Nicht automatisiert prüfbar | Cloudflare-Challenge blockiert API-Zugriff |
| **VirusTotal** | ⚠️ Nicht abrufbar (Timeout) | Manuell prüfen: https://www.virustotal.com/gui/domain/hstc.space |
| **Norton Safe Web** | ✅ Kein öffentlicher Threat-Hinweis | https://safeweb.norton.com/report?url=hstc.space |
| **Sucuri SiteCheck** | ⚠️ Scan-Formular, kein fertiges Ergebnis | Manuell: https://sitecheck.sucuri.net/ |
| **Talos (Cisco)** | ⚠️ Timeout | Manuell: https://talosintelligence.com/reputation_center |

**Ergebnis:** In den öffentlich zugänglichen Quellen **kein Nachweis**, dass `hstc.space` aktuell als Malware/Phishing gelistet ist.

---

### 6.2 G DATA Webschutz — mögliches False Positive

**Status:** G DATA blocklists sind **proprietär** und nicht öffentlich abfragbar. Ein direkter Check war von extern **nicht möglich**.

Wenn Nutzer mit G DATA Internet Security / G DATA Total Security die Meldung sehen:

> *„G DATA INTERNET SECURITY hat den Zugriff auf diese Webseite verweigert, da sie aktuell oder in der Vergangenheit als sicherheitsgefährdend eingestuft wurde."*

… ist das typischerweise ein **URL-Reputation-False-Positive**, kein Nachweis für aktuelle Malware.

#### Mögliche Ursachen (speziell für hstc.space)

1. **Domain-Historie:**  
   Laut [urlscan.io](https://urlscan.io/api/v1/search/?q=domain:hstc.space) gab es ältere Scans (2020–2023) mit:
   - Hosting auf **DATAWIRE Schweiz** (nginx), nicht AWS
   - Sehr viele Third-Party-Requests (WordPress, Twitch, Google Ads, etc.)
   - Tag `@phishunt_io` (Phishing-Monitoring-Feed — **bedeutet nicht automatisch „Phishing"**, aber kann Reputation beeinflussen)
   - Subdomain `intern.hstc.space` (2020/2021)

2. **TLD `.space`:**  
   Generische TLDs werden von AV-Anbietern statistisch häufiger eingeschränkt.

3. **Externe Ressourcen:**  
   Die Seite lädt Inhalte von Discord CDN und AWS Lambda Function URLs. Manche AV-Lösungen werten unbekannte `.space`-Domains mit externen Backend-URLs als riskanter ein.

4. **Fehlende Security-Header / Redirect-Probleme:**  
   Technisch unsaubere Konfiguration (404-Redirects, fehlendes HSTS) kann Reputation-Scoring negativ beeinflussen.

#### Was tun bei G DATA-Block?

1. **URL bei G DATA zur Analyse einreichen (False Positive melden):**  
   https://www.gdata.de/help-en/business/HowToArticles/VirusAnalysis/sendFileAppURL/  
   (Deutsch: „Verdächtige URL einsenden")

2. **Nicht pauschal Webschutz deaktivieren** — nur gezielte Ausnahme nach Freigabe.

3. **Seite „sauber" machen**, damit Re-Scans positiv ausfallen:
   - Redirects fixen (Abschnitt 3.1)
   - Security-Header setzen (Abschnitt 3.5)
   - `amplify_outputs.json` deployen
   - Veralteten Preconnect entfernen

4. **G DATA Support kontaktieren** mit:
   - Betroffene URL: `https://hstc.space/`
   - Hinweis: Seite ist legitime Vereins-/Organisationswebsite (Star Citizen Org)
   - Hosting: AWS Amplify / CloudFront
   - Keine Malware, keine Phishing-Inhalte

> Referenz: Ähnliche False Positives bei G DATA wurden in Community-Fällen nach URL-Einreichung wieder freigegeben.

---

### 6.3 Norton & andere AV-Anbieter

| Anbieter | Prüfbarkeit | Ergebnis |
|---|---|---|
| **Norton Safe Web** | Öffentliche Abfrage | Kein Threat-Hinweis sichtbar |
| **Windows Defender SmartScreen** | Nur clientseitig | Nicht extern prüfbar |
| **Kaspersky / ESET / Bitdefender** | Proprietär | Nur über VirusTotal-Aggregation oder manuelle Meldung |

**Empfehlung:** Domain manuell auf VirusTotal prüfen und ggf. „False Positive" melden, falls einzelne Engines flaggen.

---

## 7. Domain-Historie (Reputation-Kontext)

| Datum | Hosting | Inhalt | Status |
|---|---|---|---|
| 2020–2021 | DATAWIRE CH, nginx | WordPress-ähnliche Seite, viele Third-Party-Requests | 200 |
| 2021-09 | DATAWIRE CH | `@phishunt_io`-Scan | 200 |
| 2023-08 | DATAWIRE CH | „Geplante Wartungsaufgaben" | 503 |
| 2026-05 (aktuell) | AWS CloudFront + S3 | React/Vite SPA (Amplify Gen 2) | 200 |

**Wichtig:** Antivirus-Anbieter wie G DATA können **alte Reputation** noch cachen, obwohl die Seite komplett neu auf AWS hostet.

---

## 8. Empfohlene Maßnahmen (Priorität)

| Prio | Maßnahme | Aufwand |
|---|---|---|
| 🔴 1 | Redirect-Regeln aus `amplify-redirects.json` in Amplify Hosting deployen | Gering |
| 🔴 2 | `amplify_outputs.json` in Production verfügbar machen | Gering |
| 🔴 3 | Bei G DATA False Positive: URL zur Analyse einreichen | Gering |
| 🟡 4 | Veralteten Lambda-Preconnect entfernen/aktualisieren | Gering |
| 🟡 5 | Security-Header (HSTS etc.) setzen | Gering |
| 🟡 6 | `www` → Apex-Redirect | Gering |
| 🟢 7 | Lighthouse/PageSpeed gegen Production laufen lassen | Gering |
| 🟢 8 | Optional: Playwright-Smoke-Tests für JS-Rendering | Mittel |
| 🟢 9 | Optional: Uptime-Monitoring (Better Stack, UptimeRobot) | Gering |

---

## 9. Nützliche Prüf-URLs

| Zweck | URL |
|---|---|
| Live-Seite | https://hstc.space/ |
| Google Safe Browsing | https://transparencyreport.google.com/safe-browsing/search?url=hstc.space |
| Norton Safe Web | https://safeweb.norton.com/report?url=hstc.space |
| VirusTotal | https://www.virustotal.com/gui/domain/hstc.space |
| urlscan.io Historie | https://urlscan.io/search/#domain:hstc.space |
| G DATA URL melden | https://www.gdata.de/help-en/business/HowToArticles/VirusAnalysis/sendFileAppURL/ |
| PageSpeed Insights | https://pagespeed.web.dev/analysis?url=https://hstc.space |

---

## 10. Testbefehle (Reproduktion)

```powershell
# Basis-Erreichbarkeit
curl -I https://hstc.space/
curl -I http://hstc.space/

# Redirects prüfen
curl -I https://hstc.space/discord
curl -I https://hstc.space/join

# Backend & Config
curl -I https://hstc.space/amplify_outputs.json
curl "https://lrm2pghvmx546sbazhbi2gi6q40wmbaw.lambda-url.eu-central-1.on.aws/?mode=both&limit=5"

# Discord Widget
curl "https://discord.com/api/guilds/628996745837150211/widget.json"
```

---

## Anhang: Repo-Dateien mit Bezug

| Datei | Relevanz |
|---|---|
| `amplify-redirects.json` | Redirect-/SPA-Regeln (noch nicht deployed) |
| `amplify.yml` | Build-Pipeline |
| `amplify/backend.ts` | Lambda Function URL für Discord Combined |
| `amplify_outputs.json` | Backend-URL (lokal vorhanden, Production fehlt) |
| `src/config/amplifyOutputs.ts` | Endpoint-Auflösung (Build → Runtime → Fallback) |
| `index.html` | Preconnect mit veralteter Lambda-URL |

---

## 11. Umgesetzte Fixes (24. Mai 2026)

| Fix | Datei(en) | Status |
|---|---|---|
| Security-Header (HSTS, X-Frame-Options, …) | `customHttp.yml` | ✅ Im Repo |
| Redirects `/discord`, `/join`, SPA-Fallback, www→apex, favicon | `amplify-redirects.json` | ✅ Im Repo |
| Redirects automatisch in CI anwenden | `scripts/apply-amplify-redirects.mjs`, `amplify.yml` postBuild | ✅ Im Repo |
| `amplify_outputs.json` → `dist/` kopieren | `vite.config.ts` (`amplifyHostingPlugin`) | ✅ Im Repo |
| Dynamischer Lambda-Preconnect beim Build | `vite.config.ts` + `index.html` | ✅ Im Repo |
| Absolute OG/Twitter-Bild-URLs | `index.html` | ✅ Im Repo |
| Beispiel-Config für lokale Entwicklung | `amplify_outputs.example.json` | ✅ Im Repo |

**Nach dem Merge:** Branch deployen lassen (Amplify CI). Redirects werden im `postBuild`-Schritt via `aws amplify update-app` gesetzt. Header kommen aus `customHttp.yml`.

**Manuell (falls CI-Redirect fehlschlägt):**
```bash
npm run apply:redirects   # benötigt AWS_APP_ID + AWS-Credentials
```
Oder `amplify-redirects.json` in der Amplify Console unter Hosting → Rewrites and redirects importieren.

---

*Erstellt im Rahmen eines Erreichbarkeits-Audits. Stand: 24. Mai 2026.*
