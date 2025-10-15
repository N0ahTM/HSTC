import { defineBackend, secret } from '@aws-amplify/backend';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { discordImages } from './functions/discord-images/resource.js';
import { discordEvents } from './functions/discord-events/resource.js';

/**
 * @see https://docs.amplify.aws/gen2/build-a-backend/ to add storage, functions, and more
 */
// Functions currently in use.
const backend = defineBackend({ discordImages, discordEvents });

// Allow providing the channel ID via plain env for local sandbox/dev.
if (process.env.DISCORD_CHANNEL_ID) {
  backend.discordImages.addEnvironment('DISCORD_CHANNEL_ID', process.env.DISCORD_CHANNEL_ID);
} else {
  backend.discordImages.addEnvironment('DISCORD_CHANNEL_ID', secret('DISCORD_CHANNEL_ID'));
}

// Prefer a plain env var when present (local dev), otherwise use Amplify Secret.
if (process.env.DISCORD_BOT_TOKEN) {
  backend.discordImages.addEnvironment('DISCORD_BOT_TOKEN', process.env.DISCORD_BOT_TOKEN);
} else {
  backend.discordImages.addEnvironment('DISCORD_BOT_TOKEN', secret('DISCORD_BOT_TOKEN'));
}

const discordImagesUrl = backend.discordImages.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedMethods: [HttpMethod.GET],
    allowedOrigins: ['*'],
    allowedHeaders: ['*'],
    allowCredentials: false
  }
}).url;

// Discord Events Function URL
const discordEventsUrl = backend.discordEvents.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedMethods: [HttpMethod.GET],
    allowedOrigins: ['*'],
    allowedHeaders: ['*'],
    allowCredentials: false
  }
}).url;

// Guild ID environment variable (events) – same pattern as above.
if (process.env.DISCORD_GUILD_ID) {
  backend.discordEvents.addEnvironment('DISCORD_GUILD_ID', process.env.DISCORD_GUILD_ID);
} else {
  backend.discordEvents.addEnvironment('DISCORD_GUILD_ID', secret('DISCORD_GUILD_ID'));
}

// Provide Bot Token to events function as well (shared secret with images function)
if (process.env.DISCORD_BOT_TOKEN) {
  backend.discordEvents.addEnvironment('DISCORD_BOT_TOKEN', process.env.DISCORD_BOT_TOKEN);
} else {
  backend.discordEvents.addEnvironment('DISCORD_BOT_TOKEN', secret('DISCORD_BOT_TOKEN'));
}

backend.addOutput({
  custom: {
    discordImagesUrl,
    discordEventsUrl
  }
});
