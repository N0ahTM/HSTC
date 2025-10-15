import { defineFunction } from '@aws-amplify/backend';

export const discordEvents = defineFunction({
  name: 'discord-events',
  entry: './handler.ts',
  timeoutSeconds: 15
});
