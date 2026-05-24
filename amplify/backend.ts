import { defineBackend, secret } from '@aws-amplify/backend';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { discordAggregate } from './functions/discord-aggregate/resource.js';

/**
 * Production backend: single aggregate Lambda exposed via Function URL.
 */
const backend = defineBackend({ discordAggregate });

const requiredSecretKeys = ['DISCORD_CHANNEL_ID', 'DISCORD_BOT_TOKEN', 'DISCORD_GUILD_ID'] as const;
const plaintextOverrides = requiredSecretKeys.filter((key) => {
  const value = process.env[key];
  return typeof value === 'string' && value.trim().length > 0;
});

if (plaintextOverrides.length > 0) {
  throw new Error(
    `[backend] Refusing plaintext env overrides for secrets: ${plaintextOverrides.join(
      ', '
    )}. Configure these values as Amplify secrets instead.`
  );
}

const allowedOrigins = (process.env.DISCORD_FUNCTION_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter((value) => value.length > 0);
const corsOrigins =
  allowedOrigins.length > 0
    ? allowedOrigins
    : ['https://hstc.space', 'https://www.hstc.space', 'http://localhost:5173'];

backend.discordAggregate.addEnvironment(
  'DISCORD_CHANNEL_ID',
  secret('DISCORD_CHANNEL_ID')
);

backend.discordAggregate.addEnvironment(
  'DISCORD_BOT_TOKEN',
  secret('DISCORD_BOT_TOKEN')
);

backend.discordAggregate.addEnvironment(
  'DISCORD_GUILD_ID',
  secret('DISCORD_GUILD_ID')
);

const discordCombinedUrl = backend.discordAggregate.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedMethods: [HttpMethod.GET],
    allowedOrigins: corsOrigins,
    allowedHeaders: ['Accept', 'Accept-Language', 'Content-Type', 'Origin', 'Referer', 'User-Agent'],
    allowCredentials: false
  }
}).url;

backend.addOutput({
  custom: {
    discordCombinedUrl
  }
});

