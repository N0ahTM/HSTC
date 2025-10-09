# Discord Images Function Setup & Testing Guide

This guide walks you through creating the Discord images ingestion flow (Amplify Gen 2 function + React integration) and validating it locally before you deploy.

## Prerequisites
- Node.js 18+
- Amplify CLI Gen 2 (`npm install -g @aws-amplify/cli`)
- Discord bot token with permission to read the media channel
- The channel ID that contains the image uploads

## 1. Backend Function Files
The repository already contains the Discord ingestion function under `amplify/functions/discord-images/handler.ts` and registers it in `amplify/backend.ts`. No additional dependencies are required—the handler relies on the native `fetch` available in the Node.js 18 runtime.

If you are adding the function to a brand-new Amplify backend, copy the entire `amplify/functions/discord-images` folder and the `amplify/backend.ts` file into your project. The backend definition wires the function to the `/api/discord-images` path when deployed.

## 2. Configure Secrets & Environment
1. Store the Discord credentials as Secrets (empfohlen, auch in Gen 2 Best Practices). Für lokale Sandboxes per CLI:
   ```powershell
   npx ampx sandbox secret set DISCORD_BOT_TOKEN
   npx ampx sandbox secret set DISCORD_CHANNEL_ID
   ```
   Für gehostete Branches in der Amplify Console: Hosting → Secrets → "Secrets verwalten" und die beiden Keys
   `DISCORD_BOT_TOKEN` und `DISCORD_CHANNEL_ID` anlegen. Unser Backend (`amplify/backend.ts`) liest beide Werte
   bevorzugt aus Umgebungsvariablen und fällt automatisch auf `secret('<KEY>')` zurück, d. h. Secrets funktionieren
   ohne zusätzliche Build-Schritte.
2. (Optional) Wenn du später eine S3‑Cache‑Schicht ergänzen willst, füge `DISCORD_CACHE_BUCKET` als Environment Variable
   (nicht geheim) oder als Secret (wenn Bucket-Name nicht öffentlich sein soll) hinzu.

## 3. Local Testing
1. Run the function locally (Sandbox):
   ```powershell
   npx ampx sandbox function invoke discord-images
   ```
   (For the legacy CLI use `amplify mock function discord-images`.)
2. Trigger the function from another terminal while the sandbox is running:
   ```powershell
   curl "http://localhost:3000/api/discord-images?limit=10"
   ```
   - Verify the response contains `data`, `page`, and `meta` sections.
3. Test pagination by passing the `before` snowflake from the last item in the previous response.
4. Confirm rate limiting by temporarily lowering the limit and observing the cache headers in the response (`meta.cache`).

## 4. Frontend Integration Checks
1. Install dependencies in the project root (if not already):
   ```bash
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:5173` and scroll to the "Community Bilder" section.
   - Ensure the carousel loads images and autoloads additional batches when you reach the end.
4. Inspect the network panel to confirm the `/api/discord-images` endpoint is called with the expected parameters and caching behaviour.

## 5. Deployment
1. Push the updated backend and frontend:
   ```bash
   ampx pipeline push
   npm run build
   ```
2. Deploy the static site via Amplify Hosting or your preferred pipeline. Monitor the function logs to confirm cache warmups and rate-limit handling behave as expected.

## Troubleshooting Tips
- **429 errors**: The function retries once automatically. If rate limits persist, increase the cache TTL or reduce the fetch frequency.
- **Empty responses**: Double-check the channel ID and ensure the bot has `Read Message History` permission.
- **Mixed content warnings**: Discord CDN URLs are HTTPS; ensure you do not rewrite them.

Refer back to the architecture document for deeper implementation details.
