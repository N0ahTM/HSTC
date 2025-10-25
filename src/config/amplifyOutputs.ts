type AmplifyCustomOutputs = {
  discordCombinedUrl?: unknown;
  [key: string]: unknown;
};

type AmplifyOutputs = {
  custom?: AmplifyCustomOutputs;
};

const isDev = import.meta.env.DEV;
let cachedCombinedEndpoint: string | null = null;
let inFlightCombinedEndpoint: Promise<string> | null = null;

const FALLBACK_REMOTE =
  typeof import.meta.env.VITE_DISCORD_COMBINED_FALLBACK === 'string'
    ? import.meta.env.VITE_DISCORD_COMBINED_FALLBACK.trim()
    : '';

async function fetchAmplifyOutputs(): Promise<AmplifyOutputs | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const response = await fetch('/amplify_outputs.json', { cache: 'no-store' });
    if (!response.ok) {
      console.warn('[discord-combined] amplify_outputs.json not available', response.status);
      return null;
    }
    const json = (await response.json()) as AmplifyOutputs;
    if (isDev) {
      console.info('[discord-combined] Loaded amplify_outputs.json at runtime', json);
    }
    return json;
  } catch (error) {
    console.warn('[discord-combined] Failed to fetch amplify_outputs.json', error);
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
    if (value && isDev) {
      console.info('[discord-combined] Resolved amplify_outputs.json from build artifacts', value);
    }
    return value ?? null;
  } catch {
    return null;
  }
}

export async function getDiscordCombinedEndpoint(): Promise<string> {
  if (cachedCombinedEndpoint) {
    return cachedCombinedEndpoint;
  }
  if (inFlightCombinedEndpoint) {
    return inFlightCombinedEndpoint;
  }

  inFlightCombinedEndpoint = (async () => {
    const envValue =
      typeof import.meta.env.VITE_DISCORD_COMBINED_ENDPOINT === 'string'
        ? import.meta.env.VITE_DISCORD_COMBINED_ENDPOINT.trim()
        : '';
    if (envValue) {
      cachedCombinedEndpoint = envValue;
      if (isDev) {
        console.info('[discord-combined] Using endpoint from VITE_DISCORD_COMBINED_ENDPOINT', cachedCombinedEndpoint);
      }
      return cachedCombinedEndpoint;
    }

    const useLocalDev =
      import.meta.env.DEV && String(import.meta.env.VITE_USE_LOCAL_DISCORD_API ?? '').toLowerCase() === 'true';
    if (useLocalDev) {
      cachedCombinedEndpoint = '/api/discord-combined';
      if (isDev) {
        console.info('[discord-combined] Using local dev endpoint /api/discord-combined');
      }
      return cachedCombinedEndpoint;
    }

    const buildOutputs = resolveFromBuildArtifacts();
    const buildCandidate = buildOutputs?.custom?.discordCombinedUrl;
    if (typeof buildCandidate === 'string' && buildCandidate.length > 0) {
      cachedCombinedEndpoint = buildCandidate;
      if (isDev) {
        console.info('[discord-combined] Using endpoint from build amplify_outputs.json', cachedCombinedEndpoint);
      }
      return cachedCombinedEndpoint;
    }

    const runtimeOutputs = await fetchAmplifyOutputs();
    const runtimeCandidate = runtimeOutputs?.custom?.discordCombinedUrl;
    if (typeof runtimeCandidate === 'string' && runtimeCandidate.length > 0) {
      cachedCombinedEndpoint = runtimeCandidate;
      if (isDev) {
        console.info('[discord-combined] Using endpoint from runtime amplify_outputs.json', cachedCombinedEndpoint);
      }
      return cachedCombinedEndpoint;
    }

    if (FALLBACK_REMOTE) {
      cachedCombinedEndpoint = FALLBACK_REMOTE;
      console.warn('[discord-combined] Using fallback remote endpoint:', cachedCombinedEndpoint);
      return cachedCombinedEndpoint;
    }

    throw new Error('Kein Discord Combined Endpoint konfiguriert.');
  })();

  try {
    return await inFlightCombinedEndpoint;
  } finally {
    inFlightCombinedEndpoint = null;
  }
}

