import { defineBackend, secret } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { discordImages } from './functions/discord-images/resource';

/**
 * @see https://docs.amplify.aws/gen2/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  discordImages
});

// Optionally customize resources using AWS CDK
// const { cfnUserPool } = backend.auth.resources.cfnResources;
// cfnUserPool.policies = {
//   passwordPolicy: {
//     minimumLength: 10,
//   },
// };

const channelId = process.env.DISCORD_CHANNEL_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;

if (channelId) {
  backend.discordImages.addEnvironment('DISCORD_CHANNEL_ID', channelId);
} else {
  console.warn('discordImages: DISCORD_CHANNEL_ID is not set; function invocations will fail until configured.');
}

if (botToken) {
  backend.discordImages.addEnvironment('DISCORD_BOT_TOKEN', botToken);
} else {
  backend.discordImages.addEnvironment('DISCORD_BOT_TOKEN', secret('DISCORD_BOT_TOKEN'));
}
