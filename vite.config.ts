import 'dotenv/config';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Local-dev middleware: forward /api/discord-images to the TS handler directly
const discordImagesApi = (): Plugin => ({
  name: 'discord-images-api',
  configureServer(server) {
    // Lazy import to avoid issues during build
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server.middlewares.use('/api/discord-images', async (req, res) => {
      try {
        const mod = await server.ssrLoadModule('/amplify/functions/discord-images/handler.ts');
        const { handler } = mod as { handler: (event: unknown) => Promise<{ statusCode: number; headers: Record<string, string>; body: string }> };
        const method = req.method ?? 'GET';
        const url = new URL(req.url ?? '', 'http://localhost');
        const query: Record<string, string | undefined> = {};
        url.searchParams.forEach((v, k) => (query[k] = v));

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
