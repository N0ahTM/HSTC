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

// Allow providing the channel ID via plain env for local sandbox/dev.
if (process.env.DISCORD_CHANNEL_ID) {
  backend.discordImages.addEnvironment('DISCORD_CHANNEL_ID', process.env.DISCORD_CHANNEL_ID);
}

// Prefer a plain env var when present (local dev), otherwise use Amplify Secret.
if (process.env.DISCORD_BOT_TOKEN) {
  backend.discordImages.addEnvironment('DISCORD_BOT_TOKEN', process.env.DISCORD_BOT_TOKEN);
} else {
  backend.discordImages.addEnvironment('DISCORD_BOT_TOKEN', secret('DISCORD_BOT_TOKEN'));
}
