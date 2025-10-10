type AmplifyCustomOutputs = {
  discordImagesUrl?: unknown;
  [key: string]: unknown;
};

type AmplifyOutputs = {
  custom?: AmplifyCustomOutputs;
};

const amplifyOutputsModules = import.meta.glob<AmplifyOutputs>('../../amplify_outputs.json', {
  eager: true,
  import: 'default'
});

const amplifyOutputs: AmplifyOutputs | null =
  Object.values(amplifyOutputsModules)[0] ?? null;

const FALLBACK_REMOTE =
  'https://dwvzp4itkvcxlfpqv7elwljq6u.appsync-api.eu-central-1.amazonaws.com/graphql/api/discord-images';
const FALLBACK_LOCAL = '/api/discord-images';

export function getDiscordImagesEndpoint(): string {
  const envValue = import.meta.env.VITE_DISCORD_IMAGES_ENDPOINT;
  if (typeof envValue === 'string' && envValue.trim().length > 0) {
    return envValue.trim();
  }

  const candidate = amplifyOutputs?.custom?.discordImagesUrl;
  if (typeof candidate === 'string' && candidate.length > 0) {
    return candidate;
  }

  const fallback = import.meta.env.DEV ? FALLBACK_LOCAL : FALLBACK_REMOTE;
  if (!amplifyOutputs) {
    console.warn(
      '[discord-images] amplify_outputs.json not found – falling back to default endpoint:',
      fallback
    );
  } else {
    console.warn(
      '[discord-images] discordImagesUrl missing in amplify_outputs.json – falling back to default endpoint:',
      fallback
    );
  }
  return fallback;
}
