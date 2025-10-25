import { defineBackend, secret } from '@aws-amplify/backend';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { discordAggregate } from './functions/discord-aggregate/resource.js';

/**
 * Production backend: single aggregate Lambda exposed via Function URL.
 */
const backend = defineBackend({ discordAggregate });

const channelIdEnv = process.env.DISCORD_CHANNEL_ID;
const botTokenEnv = process.env.DISCORD_BOT_TOKEN;
const guildIdEnv = process.env.DISCORD_GUILD_ID;

backend.discordAggregate.addEnvironment(
  'DISCORD_CHANNEL_ID',
  channelIdEnv ? channelIdEnv : secret('DISCORD_CHANNEL_ID')
);

backend.discordAggregate.addEnvironment(
  'DISCORD_BOT_TOKEN',
  botTokenEnv ? botTokenEnv : secret('DISCORD_BOT_TOKEN')
);

backend.discordAggregate.addEnvironment(
  'DISCORD_GUILD_ID',
  guildIdEnv ? guildIdEnv : secret('DISCORD_GUILD_ID')
);

const discordCombinedUrl = backend.discordAggregate.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedMethods: [HttpMethod.GET],
    allowedOrigins: ['*'],
    allowedHeaders: ['*'],
    allowCredentials: false
  }
}).url;

backend.addOutput({
  custom: {
    discordCombinedUrl
  }
});

