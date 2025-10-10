import 'dotenv/config';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Local-dev middleware: forward /api/discord-images to the TS handler directly
const discordImagesApi = (): Plugin => ({
  name: 'discord-images-api',
  configureServer(server) {
    // Lazy import to avoid issues during build
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server.middlewares.use('/api/discord-images', async (req, res) => {
      try {
        const method = req.method ?? 'GET';
        const url = new URL(req.url ?? '', 'http://localhost');
        const query: Record<string, string | undefined> = {};
        url.searchParams.forEach((v, k) => (query[k] = v));

        const hasSecrets = Boolean(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_CHANNEL_ID);

        if (hasSecrets) {
          // Run the handler locally when secrets are available
          const mod = await server.ssrLoadModule('/amplify/functions/discord-images/handler.ts');
          const { handler } = mod as { handler: (event: unknown) => Promise<{ statusCode: number; headers: Record<string, string>; body: string }> };
          const event = {
            requestContext: { http: { method } },
            queryStringParameters: query
          } as const;

          const result = await handler(event as any);
          res.statusCode = result.statusCode;
          for (const [k, v] of Object.entries(result.headers)) {
            res.setHeader(k, String(v));
          }
          res.end(result.body);
          return;
        }

        // Fallback: proxy to the deployed Lambda URL to avoid CORS in the browser during dev
        let remoteEndpoint = (process.env.VITE_DISCORD_IMAGES_ENDPOINT ?? '').toString().trim();
        if (!remoteEndpoint) {
          try {
            const jsonPath = path.join(process.cwd(), 'amplify_outputs.json');
            const content = await readFile(jsonPath, 'utf-8');
            const parsed = JSON.parse(content) as { custom?: { discordImagesUrl?: string } };
            remoteEndpoint = parsed.custom?.discordImagesUrl ?? '';
          } catch {
            // ignore
          }
        }

        if (!remoteEndpoint) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'No remote endpoint configured. Set VITE_DISCORD_IMAGES_ENDPOINT or amplify_outputs.json.' }));
          return;
        }

        const target = new URL(remoteEndpoint);
        for (const [k, v] of Object.entries(query)) {
          if (typeof v === 'string') target.searchParams.set(k, v);
        }

        const upstream = await fetch(target, { method: 'GET', headers: { Accept: 'application/json' } });

        res.statusCode = upstream.status;
        // Copy minimal headers
        res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length');
        const buf = Buffer.from(await upstream.arrayBuffer());
        res.setHeader('Content-Length', String(buf.length));
        res.end(buf);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Local API middleware error', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Local API error' }));
      }
    });
  }
});

export default defineConfig({
  plugins: [react(), discordImagesApi()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    chunkSizeWarningLimit: 600
  },
  server: {
    port: 5173,
    open: true
  }
});
