import { defineBackend, secret } from '@aws-amplify/backend';
import { discordImages } from './functions/discord-images/resource.js';

const backend = defineBackend({
  discordImages
});

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
