import { defineBackend, secret } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginRequestPolicy,
  ViewerProtocolPolicy
} from 'aws-cdk-lib/aws-cloudfront';
import { FunctionUrlOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { CfnWebACL, CfnWebACLAssociation } from 'aws-cdk-lib/aws-wafv2';
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
});

const edgeOriginHeaderName = 'x-hstc-edge-key';
const edgeOriginHeaderValue = (process.env.DISCORD_EDGE_ORIGIN_KEY ?? '').trim();
if (edgeOriginHeaderValue) {
  backend.discordAggregate.addEnvironment('DISCORD_EDGE_ORIGIN_KEY', edgeOriginHeaderValue);
}

const edgeStack = backend.createStack('DiscordAggregateEdge');
const discordCombinedDistribution = new Distribution(edgeStack, 'DiscordAggregateDistribution', {
  comment: 'CloudFront edge for discord aggregate function URL',
  defaultBehavior: {
    origin: new FunctionUrlOrigin(discordCombinedUrl, {
      customHeaders: edgeOriginHeaderValue
        ? {
            [edgeOriginHeaderName]: edgeOriginHeaderValue
          }
        : undefined
    }),
    allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: CachePolicy.CACHING_DISABLED,
    originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER
  }
});

const webAcl = new CfnWebACL(edgeStack, 'DiscordAggregateWebAcl', {
  name: 'discord-aggregate-waf',
  scope: 'CLOUDFRONT',
  defaultAction: { allow: {} },
  visibilityConfig: {
    cloudWatchMetricsEnabled: true,
    metricName: 'DiscordAggregateWaf',
    sampledRequestsEnabled: true
  },
  rules: [
    {
      name: 'RateLimitByIp',
      priority: 0,
      statement: {
        rateBasedStatement: {
          aggregateKeyType: 'IP',
          limit: 1200
        }
      },
      action: {
        block: {}
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'DiscordAggregateRateLimitByIp',
        sampledRequestsEnabled: true
      }
    }
  ]
});

new CfnWebACLAssociation(edgeStack, 'DiscordAggregateWebAclAssociation', {
  webAclArn: webAcl.attrArn,
  resourceArn: `arn:aws:cloudfront::${Stack.of(edgeStack).account}:distribution/${discordCombinedDistribution.distributionId}`
});

backend.addOutput({
  custom: {
    discordCombinedUrl: `https://${discordCombinedDistribution.distributionDomainName}/`,
    discordCombinedOriginUrl: discordCombinedUrl.url
  }
});

