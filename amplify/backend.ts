import { defineBackend, secret } from '@aws-amplify/backend';
import { discordImages } from './functions/discord-images/resource';

const backend = defineBackend({
  discordImages
});

if (process.env.DISCORD_CHANNEL_ID) {
  backend.discordImages.addEnvironment('DISCORD_CHANNEL_ID', process.env.DISCORD_CHANNEL_ID);
}

backend.discordImages.addEnvironment('DISCORD_BOT_TOKEN', secret('DISCORD_BOT_TOKEN'));
