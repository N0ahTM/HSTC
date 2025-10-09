import { defineFunction } from '@aws-amplify/backend';

export const discordImages = defineFunction({
  name: 'discord-images',
  entry: './handler.ts',
  timeoutSeconds: 20
});
