import { defineBackend, secret } from '@aws-amplify/backend';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { discordImages } from './functions/discord-images/resource.js';

const backend = defineBackend({
  discordImages
});

const cacheBucket = new Bucket(backend.stack, 'DiscordImagesCache', {
  blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
  encryption: BucketEncryption.S3_MANAGED,
  enforceSSL: true,
  removalPolicy: RemovalPolicy.RETAIN,
  autoDeleteObjects: false,
  lifecycleRules: [
    {
      id: 'ExpireDiscordCache',
      prefix: 'cache/',
      expiration: Duration.days(7)
    }
  ]
});

cacheBucket.grantReadWrite(backend.discordImages.resources.lambda);
backend.discordImages.addEnvironment('CACHE_BUCKET_NAME', cacheBucket.bucketName);

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

const discordImagesUrl = backend.discordImages.resources.lambda.addFunctionUrl({
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
    discordImagesUrl
  }
});
