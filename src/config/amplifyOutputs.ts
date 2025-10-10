type AmplifyCustomOutputs = {
  discordImagesUrl?: unknown;
  [key: string]: unknown;
};

type AmplifyOutputs = {
  custom?: AmplifyCustomOutputs;
};

let cachedEndpoint: string | null = null;
let inFlightEndpoint: Promise<string> | null = null;

const FALLBACK_REMOTE =
  typeof import.meta.env.VITE_DISCORD_IMAGES_FALLBACK === 'string'
    ? import.meta.env.VITE_DISCORD_IMAGES_FALLBACK.trim()
    : '';

async function fetchAmplifyOutputs(): Promise<AmplifyOutputs | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const response = await fetch('/amplify_outputs.json', { cache: 'no-store' });
    if (!response.ok) {
      console.warn('[discord-images] amplify_outputs.json not available', response.status);
      return null;
    }
    const json = (await response.json()) as AmplifyOutputs;
    console.info('[discord-images] Loaded amplify_outputs.json at runtime', json);
    return json;
  } catch (error) {
    console.warn('[discord-images] Failed to fetch amplify_outputs.json', error);
    return null;
  }
}

function resolveFromBuildArtifacts(): AmplifyOutputs | null {
  try {
    const modules = import.meta.glob<AmplifyOutputs>('../../amplify_outputs.json', {
      eager: true,
      import: 'default'
    });
    const value = Object.values(modules)[0];
    if (value) {
      console.info('[discord-images] Resolved amplify_outputs.json from build artifacts', value);
    }
    return value ?? null;
  } catch {
    return null;
  }
}

export async function getDiscordImagesEndpoint(): Promise<string> {
  if (cachedEndpoint) {
    return cachedEndpoint;
  }

  if (inFlightEndpoint) {
    return inFlightEndpoint;
  }

  inFlightEndpoint = (async () => {
    const envValue = typeof import.meta.env.VITE_DISCORD_IMAGES_ENDPOINT === 'string' ? import.meta.env.VITE_DISCORD_IMAGES_ENDPOINT.trim() : '';
    if (envValue) {
      cachedEndpoint = envValue;
      console.info('[discord-images] Using endpoint from VITE_DISCORD_IMAGES_ENDPOINT', cachedEndpoint);
      return cachedEndpoint;
    }

    // Optional: in Vite dev, allow opting into the local middleware to avoid cross-origin headaches
    const useLocalDev = import.meta.env.DEV && String(import.meta.env.VITE_USE_LOCAL_DISCORD_API ?? '').toLowerCase() === 'true';
    if (useLocalDev) {
      cachedEndpoint = '/api/discord-images';
      console.info('[discord-images] Using local dev endpoint /api/discord-images');
      return cachedEndpoint;
    }

    const buildOutputs = resolveFromBuildArtifacts();
    const buildCandidate = buildOutputs?.custom?.discordImagesUrl;
    if (typeof buildCandidate === 'string' && buildCandidate.length > 0) {
      cachedEndpoint = buildCandidate;
      console.info('[discord-images] Using endpoint from build amplify_outputs.json', cachedEndpoint);
      return cachedEndpoint;
    }

  const runtimeOutputs = await fetchAmplifyOutputs();
    const runtimeCandidate = runtimeOutputs?.custom?.discordImagesUrl;
    if (typeof runtimeCandidate === 'string' && runtimeCandidate.length > 0) {
      cachedEndpoint = runtimeCandidate;
      console.info('[discord-images] Using endpoint from runtime amplify_outputs.json', cachedEndpoint);
      return cachedEndpoint;
    }

    if (FALLBACK_REMOTE) {
      cachedEndpoint = FALLBACK_REMOTE;
      console.warn('[discord-images] Using fallback remote endpoint:', cachedEndpoint);
      return cachedEndpoint;
    }

    console.error('[discord-images] No endpoint could be resolved. Check amplify_outputs.json or environment configuration.');
    throw new Error('Kein Discord Images Endpoint konfiguriert.');
  })();

  try {
    return await inFlightEndpoint;
  } finally {
    inFlightEndpoint = null;
  }
}


