# AWS CLI + SSO + Amplify Sandbox (Windows, DE)

Dieses Dokument beschreibt alle Schritte, die du für die lokale Arbeit mit der Amplify Gen 2 Sandbox brauchst – inklusive AWS CLI Installation, SSO‑Login, Profil‑Nutzung und Troubleshooting unter Windows PowerShell.

## Voraussetzungen
- Windows 11 mit PowerShell
- Node.js 18+ und npm
- Zugriff auf den HSTC AWS‑SSO Start‑URL: `https://d-99675ae8b6.awsapps.com/start`
- Region: `eu-central-1`

## 1) AWS CLI installieren (Windows)

Empfohlen via winget:

```powershell
winget install -e --id Amazon.AWSCLI
aws --version
```

Alternative: MSI von https://aws.amazon.com/cli/ herunterladen und installieren.

## 2) SSO‑Profil konfigurieren

Führe die SSO‑Konfiguration einmalig aus. Dadurch wird ein AWS CLI Profil (z. B. `hstc-dev`) erstellt.

```powershell
aws configure sso
```

Empfohlene Eingaben (Beispiel):
- SSO session name: `hstc`
- SSO start URL: `https://d-99675ae8b6.awsapps.com/start`
- SSO region: `eu-central-1`
- SSO registration scopes: ENTER für Standard (`sso:account:access`)
- Account: wähle `133347220319`
- Role: `AdministratorAccess`
- Default client Region: `eu-central-1`
- CLI default output format: ENTER (oder `json`)
- Profile name: `hstc-dev`

Die CLI zeigt dir anschließend den Hinweis, wie du das Profil nutzt, z. B. `aws sts get-caller-identity --profile hstc-dev`.

## 3) SSO Login und Profil nutzen

Melde dich per SSO an und verwende danach dein Profil global in der aktuellen PowerShell‑Session:

```powershell
aws sso login --profile hstc-dev
$env:AWS_PROFILE = "hstc-dev"
aws sts get-caller-identity
```

Erwartete Ausgabe (gekürzt):

```json
{
  "Account": "133347220319",
  "Arn": "arn:aws:sts::133347220319:assumed-role/.../hstc-dev"
}
```

Hinweise:
- Wenn du `Unable to locate credentials` siehst, fehlt vermutlich `--profile hstc-dev` oder die Umgebungsvariable `AWS_PROFILE`.
- Die PowerShell‑Variable `$env:AWS_PROFILE` gilt nur für das aktuelle Fenster. Dauerhaft (Benutzer‑weit) setzen:
  - Option A (erfordert neues Terminal): `setx AWS_PROFILE "hstc-dev"`
  - Option B (ohne neues Terminal für Folgesitzungen):
    ```powershell
    [Environment]::SetEnvironmentVariable("AWS_PROFILE","hstc-dev","User")
    ```

## 4) Amplify Backend CLI prüfen und Sandbox starten

Version prüfen (optional):

```powershell
npm run ampx:version
```

Sandbox starten (legt deine persönliche Cloud‑Sandbox an und beobachtet Code‑Änderungen):

```powershell
npm run sandbox
```

Wichtig:
- Am Ende wird `amplify_outputs.json` im Projektwurzelverzeichnis erzeugt/aktualisiert.
- Die Datei ist bereits in `.gitignore` und wird vom Frontend für `Amplify.configure(...)` genutzt.
- Zum Aufräumen/Entfernen deiner Sandbox:

```powershell
npm run sandbox:remove
```

## 5) Frontend lokal starten (mit Sandbox‑Backend)

In einem zweiten Terminal (optional):

```powershell
npm install
npm run dev
```

Das Frontend verwendet automatisch die Werte aus `amplify_outputs.json`, wenn diese vorhanden sind.

## 6) Secrets für die Discord‑Images‑Funktion (optional)

Für die Funktion unter `amplify/functions/discord-images` brauchst du zwei Secrets:
- `DISCORD_BOT_TOKEN`
- `DISCORD_CHANNEL_ID`

Im Sandbox‑Kontext setzen:

```powershell
npx -y -p @aws-amplify/backend-cli@latest ampx sandbox secret set DISCORD_BOT_TOKEN
npx -y -p @aws-amplify/backend-cli@latest ampx sandbox secret set DISCORD_CHANNEL_ID
```

Mehr Details findest du in `docs/discord-images-function-setup.md`.

## 7) Typische Probleme (Troubleshooting)

- Fehlermeldung: `Unable to locate credentials`
  - Lösung: `aws sso login --profile hstc-dev` erneut ausführen und entweder `--profile hstc-dev` an jeden CLI‑Befehl anhängen oder `$env:AWS_PROFILE = "hstc-dev"` setzen.

- Falsche/abgelaufene SSO Session im Browser
  - Lösung: `aws sso logout` (optional), dann `aws sso login --profile hstc-dev` neu ausführen.

- Sandbox hängt oder falsche Region
  - Stelle sicher, dass dein Profil auf `eu-central-1` konfiguriert ist (`aws configure sso` Schritt) und `$env:AWS_PROFILE` gesetzt ist.

- `amplify_outputs.json` fehlt nach Sandbox
  - Warte bis die Sandbox‑Ausgabe „Deployment completed“ erscheint. Danach sollte `amplify_outputs.json` geschrieben werden.

- Node Runtime/Build‑Fehler
  - Stelle sicher, dass Node.js 18+ installiert ist.

## 8) Referenzen
- Amplify Gen 2 Docs: https://docs.amplify.aws/gen2/
- AWS CLI SSO: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html
- Projektinterne Doku: `docs/amplify-gen2-integration.md`
