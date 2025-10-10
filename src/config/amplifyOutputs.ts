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
const FALLBACK_LOCAL = '/api/discord-images';

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
    return (await response.json()) as AmplifyOutputs;
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
      return cachedEndpoint;
    }

    const buildOutputs = resolveFromBuildArtifacts();
    const buildCandidate = buildOutputs?.custom?.discordImagesUrl;
    if (typeof buildCandidate === 'string' && buildCandidate.length > 0) {
      cachedEndpoint = buildCandidate;
      return cachedEndpoint;
    }

    const runtimeOutputs = await fetchAmplifyOutputs();
    const runtimeCandidate = runtimeOutputs?.custom?.discordImagesUrl;
    if (typeof runtimeCandidate === 'string' && runtimeCandidate.length > 0) {
      cachedEndpoint = runtimeCandidate;
      return cachedEndpoint;
    }

    if (import.meta.env.DEV) {
      cachedEndpoint = FALLBACK_LOCAL;
      console.warn('[discord-images] Using local dev proxy endpoint:', cachedEndpoint);
      return cachedEndpoint;
    }

    if (FALLBACK_REMOTE) {
      cachedEndpoint = FALLBACK_REMOTE;
      console.warn('[discord-images] Using fallback remote endpoint:', cachedEndpoint);
      return cachedEndpoint;
    }

    throw new Error('Kein Discord Images Endpoint konfiguriert.');
  })();

  try {
    return await inFlightEndpoint;
  } finally {
    inFlightEndpoint = null;
  }
}
