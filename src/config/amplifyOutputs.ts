type AmplifyCustomOutputs = {
  discordImagesUrl?: unknown;
  discordEventsUrl?: unknown;
  [key: string]: unknown;
};

type AmplifyOutputs = {
  custom?: AmplifyCustomOutputs;
};

let cachedImagesEndpoint: string | null = null;
let inFlightImagesEndpoint: Promise<string> | null = null;
let cachedEventsEndpoint: string | null = null;
let inFlightEventsEndpoint: Promise<string> | null = null;

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
  if (cachedImagesEndpoint) {
    return cachedImagesEndpoint;
  }

  if (inFlightImagesEndpoint) {
    return inFlightImagesEndpoint;
  }

  inFlightImagesEndpoint = (async () => {
    const envValue = typeof import.meta.env.VITE_DISCORD_IMAGES_ENDPOINT === 'string' ? import.meta.env.VITE_DISCORD_IMAGES_ENDPOINT.trim() : '';
    if (envValue) {
      cachedImagesEndpoint = envValue;
      console.info('[discord-images] Using endpoint from VITE_DISCORD_IMAGES_ENDPOINT', cachedImagesEndpoint);
      return cachedImagesEndpoint;
    }

    // Optional: in Vite dev, allow opting into the local middleware to avoid cross-origin headaches
    const useLocalDev = import.meta.env.DEV && String(import.meta.env.VITE_USE_LOCAL_DISCORD_API ?? '').toLowerCase() === 'true';
    if (useLocalDev) {
      cachedImagesEndpoint = '/api/discord-images';
      console.info('[discord-images] Using local dev endpoint /api/discord-images');
      return cachedImagesEndpoint;
    }

    const buildOutputs = resolveFromBuildArtifacts();
    const buildCandidate = buildOutputs?.custom?.discordImagesUrl;
    if (typeof buildCandidate === 'string' && buildCandidate.length > 0) {
      cachedImagesEndpoint = buildCandidate;
      console.info('[discord-images] Using endpoint from build amplify_outputs.json', cachedImagesEndpoint);
      return cachedImagesEndpoint;
    }

  const runtimeOutputs = await fetchAmplifyOutputs();
    const runtimeCandidate = runtimeOutputs?.custom?.discordImagesUrl;
    if (typeof runtimeCandidate === 'string' && runtimeCandidate.length > 0) {
      cachedImagesEndpoint = runtimeCandidate;
      console.info('[discord-images] Using endpoint from runtime amplify_outputs.json', cachedImagesEndpoint);
      return cachedImagesEndpoint;
    }

    if (FALLBACK_REMOTE) {
      cachedImagesEndpoint = FALLBACK_REMOTE;
      console.warn('[discord-images] Using fallback remote endpoint:', cachedImagesEndpoint);
      return cachedImagesEndpoint;
    }

    console.error('[discord-images] No endpoint could be resolved. Check amplify_outputs.json or environment configuration.');
    throw new Error('Kein Discord Images Endpoint konfiguriert.');
  })();

  try {
    return await inFlightImagesEndpoint;
  } finally {
    inFlightImagesEndpoint = null;
  }
}

export async function getDiscordEventsEndpoint(): Promise<string> {
  if (cachedEventsEndpoint) {
    return cachedEventsEndpoint;
  }
  if (inFlightEventsEndpoint) {
    return inFlightEventsEndpoint;
  }

  inFlightEventsEndpoint = (async () => {
    const envValue = typeof import.meta.env.VITE_DISCORD_EVENTS_ENDPOINT === 'string' ? import.meta.env.VITE_DISCORD_EVENTS_ENDPOINT.trim() : '';
    if (envValue) {
      cachedEventsEndpoint = envValue;
      console.info('[discord-events] Using endpoint from VITE_DISCORD_EVENTS_ENDPOINT', cachedEventsEndpoint);
      return cachedEventsEndpoint;
    }

    const useLocalDev = import.meta.env.DEV && String(import.meta.env.VITE_USE_LOCAL_DISCORD_API ?? '').toLowerCase() === 'true';
    if (useLocalDev) {
      cachedEventsEndpoint = '/api/discord-events';
      console.info('[discord-events] Using local dev endpoint /api/discord-events');
      return cachedEventsEndpoint;
    }

    const buildOutputs = resolveFromBuildArtifacts();
    const buildCandidate = buildOutputs?.custom?.discordEventsUrl;
    if (typeof buildCandidate === 'string' && buildCandidate.length > 0) {
      cachedEventsEndpoint = buildCandidate;
      console.info('[discord-events] Using endpoint from build amplify_outputs.json', cachedEventsEndpoint);
      return cachedEventsEndpoint;
    }

    const runtimeOutputs = await fetchAmplifyOutputs();
    const runtimeCandidate = runtimeOutputs?.custom?.discordEventsUrl;
    if (typeof runtimeCandidate === 'string' && runtimeCandidate.length > 0) {
      cachedEventsEndpoint = runtimeCandidate;
      console.info('[discord-events] Using endpoint from runtime amplify_outputs.json', cachedEventsEndpoint);
      return cachedEventsEndpoint;
    }

    if (FALLBACK_REMOTE) {
      cachedEventsEndpoint = FALLBACK_REMOTE;
      console.warn('[discord-events] Using fallback remote endpoint:', cachedEventsEndpoint);
      return cachedEventsEndpoint;
    }

    console.error('[discord-events] No events endpoint could be resolved.');
    throw new Error('Kein Discord Events Endpoint konfiguriert.');
  })();

  try {
    return await inFlightEventsEndpoint;
  } finally {
    inFlightEventsEndpoint = null;
  }
}


