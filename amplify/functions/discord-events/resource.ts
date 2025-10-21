import { defineFunction } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const discordEvents = defineFunction((scope) => {
  const lambda = new NodejsFunction(scope, 'DiscordEventsHandler', {
    entry: path.join(__dirname, 'handler.ts'),
    handler: 'handler',
    runtime: Runtime.NODEJS_20_X,
    memorySize: 512,
    timeout: Duration.seconds(15),
    bundling: {
      minify: true,
      target: 'node20',
      format: OutputFormat.CJS
    }
  });

  return lambda;
});
