import { defineFunction } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const discordAggregate = defineFunction((scope) => {
  const lambda = new NodejsFunction(scope, 'DiscordAggregateHandler', {
    entry: path.join(__dirname, 'handler.ts'),
    handler: 'handler',
    runtime: Runtime.NODEJS_20_X,
    architecture: Architecture.ARM_64,
    memorySize: 256,
    timeout: Duration.seconds(20),
    bundling: {
      minify: true,
      target: 'node20',
      format: OutputFormat.CJS
    }
  });

  return lambda;
});

