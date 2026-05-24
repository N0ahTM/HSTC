import 'dotenv/config';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { fileURLToPath, URL } from 'node:url';
import { readFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

type AmplifyOutputs = {
  custom?: {
    discordCombinedUrl?: string;
  };
};

type ProxyOptions = {
  route: string;
  handlerModule: string;
  envEndpointVar: string;
  amplifyKey: keyof NonNullable<AmplifyOutputs['custom']>;
  requiredSecrets: string[];
  logScope: string;
};

type DevServer = {
  middlewares: {
    use: (
      route: string,
      handler: (req: IncomingMessage, res: ServerResponse, next?: () => void) => void
    ) => void;
  };
  ssrLoadModule: (id: string) => Promise<unknown>;
};

type MinimalVitePlugin = Plugin;

const amplifyOutputsCache: { value: AmplifyOutputs | null; inFlight: Promise<AmplifyOutputs | null> | null } = {
  value: null,
  inFlight: null
};

async function loadAmplifyOutputs(): Promise<AmplifyOutputs | null> {
  if (amplifyOutputsCache.value) {
    return amplifyOutputsCache.value;
  }
  if (amplifyOutputsCache.inFlight) {
    return amplifyOutputsCache.inFlight;
  }
  amplifyOutputsCache.inFlight = (async () => {
    try {
      const jsonPath = path.join(process.cwd(), 'amplify_outputs.json');
      const content = await readFile(jsonPath, 'utf-8');
      return JSON.parse(content) as AmplifyOutputs;
    } catch {
      return null;
    } finally {
      amplifyOutputsCache.inFlight = null;
    }
  })();
  amplifyOutputsCache.value = await amplifyOutputsCache.inFlight;
  return amplifyOutputsCache.value;
}

async function resolveRemoteEndpoint(envVar: string, key: keyof NonNullable<AmplifyOutputs['custom']>): Promise<string | null> {
  const direct = (process.env[envVar] ?? '').toString().trim();
  if (direct) {
    return direct;
  }
  const outputs = await loadAmplifyOutputs();
  const candidate = outputs?.custom?.[key];
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
}


function resolveDiscordCombinedOrigin(outputs: AmplifyOutputs | null): string | null {
  const envEndpoint = (process.env.VITE_DISCORD_COMBINED_ENDPOINT ?? '').trim();
  const candidate =
    envEndpoint ||
    (typeof outputs?.custom?.discordCombinedUrl === 'string' ? outputs.custom.discordCombinedUrl : '');
  if (!candidate) return null;
  try {
    return new URL(candidate).origin;
  } catch {
    return null;
  }
}

const amplifyHostingPlugin = (): MinimalVitePlugin => ({
  name: 'amplify-hosting',
  transformIndexHtml: {
    order: 'pre',
    async handler(html: string) {
      const outputs = await loadAmplifyOutputs();
      const lambdaOrigin = resolveDiscordCombinedOrigin(outputs);
      const preconnect = lambdaOrigin
        ? `  <link rel="preconnect" href="${lambdaOrigin}" crossorigin />\n`
        : '';
      return html.replace('  <!-- hstc:lambda-preconnect -->', preconnect);
    }
  },
  async closeBundle() {
    const src = path.join(process.cwd(), 'amplify_outputs.json');
    const dest = path.join(process.cwd(), 'dist', 'amplify_outputs.json');
    if (!existsSync(src)) {
      console.warn('[amplify-hosting] amplify_outputs.json not found — skipping copy to dist/.');
      return;
    }
    await copyFile(src, dest);
    console.info('[amplify-hosting] Copied amplify_outputs.json to dist/.');
  }
});

const createAmplifyProxy = (options: ProxyOptions): MinimalVitePlugin => ({
  name: `${options.logScope}-api`,
  configureServer(server: DevServer) {
    server.middlewares.use(options.route, async (req: IncomingMessage, res: ServerResponse) => {
      const method = req.method ?? 'GET';
      const requestUrl = new URL(req.url ?? '', 'http://localhost');
      const query: Record<string, string | undefined> = {};
      requestUrl.searchParams.forEach((v, k) => (query[k] = v));

      try {
        const hasSecrets = options.requiredSecrets.every((name) => Boolean(process.env[name]));

        if (hasSecrets) {
          const mod = await server.ssrLoadModule(options.handlerModule);
          const { handler } = mod as {
            handler: (event: { requestContext: { http: { method: string } }; queryStringParameters: Record<string, string | undefined> }) => Promise<{
              statusCode: number;
              headers: Record<string, string>;
              body: string;
            }>;
          };

          const event = {
            requestContext: { http: { method } },
            queryStringParameters: query
          } as const;

          const result = await handler(event);
          res.statusCode = result.statusCode;
          for (const [header, value] of Object.entries(result.headers)) {
            res.setHeader(header, value);
          }
          res.end(result.body);
          return;
        }

        const remoteEndpoint = await resolveRemoteEndpoint(options.envEndpointVar, options.amplifyKey);
        if (!remoteEndpoint) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: `No remote endpoint configured for ${options.logScope}. Set ${options.envEndpointVar} or provide amplify_outputs.json.`
            })
          );
          return;
        }

        const target = new URL(remoteEndpoint);
        for (const [key, value] of Object.entries(query)) {
          if (typeof value === 'string') {
            target.searchParams.set(key, value);
          }
        }

        const upstream = await fetch(target, { method: 'GET', headers: { Accept: 'application/json' } });
        res.statusCode = upstream.status;
        res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length');
        const buf = Buffer.from(await upstream.arrayBuffer());
        res.setHeader('Content-Length', String(buf.length));
        res.end(buf);
      } catch (error) {
        console.error(`[${options.logScope}] local API middleware error`, error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Local API middleware error' }));
      }
    });
  }
});

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 1024,
      algorithm: 'brotliCompress',
      ext: '.br'
    }),
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 1024,
      algorithm: 'gzip',
      ext: '.gz'
    }),
    createAmplifyProxy({
      route: '/api/discord-combined',
      handlerModule: '/amplify/functions/discord-aggregate/handler.ts',
      envEndpointVar: 'VITE_DISCORD_COMBINED_ENDPOINT',
      amplifyKey: 'discordCombinedUrl',
      requiredSecrets: ['DISCORD_BOT_TOKEN', 'DISCORD_CHANNEL_ID', 'DISCORD_GUILD_ID'],
      logScope: 'discord-combined'
    }),
    amplifyHostingPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 600
  },
  server: {
    port: 5173,
    open: true
  }
});
