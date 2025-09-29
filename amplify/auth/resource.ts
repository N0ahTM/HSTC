import { defineAuth, secret } from '@aws-amplify/backend';

/**
 * Cognito configuration that delegates sign-in to Discord via a custom OIDC provider.
 * The Discord client id/secret must be stored as Amplify secrets (DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET).
 */
const discordClientId = secret('DISCORD_CLIENT_ID');
const discordClientSecret = secret('DISCORD_CLIENT_SECRET');

export const auth = defineAuth({
  loginWith: {
    oauth: {
      domainPrefix: 'hstc-platform',
      scopes: ['openid', 'email', 'profile'],
      responseType: 'code',
      redirectSignInUrl: [
        'http://localhost:5173/',
        'https://hstc.space/',
        'https://hstc.space/?disidcallback=discord',
      ],
      redirectSignOutUrl: [
        'http://localhost:5173/',
        'https://hstc.space/',
      ],
      providers: {
        oidc: [
          {
            name: 'discord',
            clientId: discordClientId,
            clientSecret: discordClientSecret,
            authorizeUrl: 'https://discord.com/api/oauth2/authorize',
            tokenUrl: 'https://discord.com/api/oauth2/token',
            attributesRequestMethod: 'GET',
            attributesUrl: 'https://discord.com/api/users/@me',
            jwksUri: 'https://discord.com/api/oauth2/jwk',
            scopes: ['identify', 'email'],
            attributeMapping: {
              email: 'email',
              preferred_username: 'username',
              name: 'global_name',
              picture: 'avatar',
              website: 'banner',
              custom: {
                'custom:discord_id': 'id',
                'custom:discord_discriminator': 'discriminator',
                'custom:discord_avatar': 'avatar',
              },
            },
          },
        ],
      },
    },
  },
  userAttributes: {
    email: {
      required: false,
      mutable: true,
    },
    'custom:discord_id': {
      dataType: 'String',
      mutable: false,
    },
    'custom:discord_discriminator': {
      dataType: 'String',
      mutable: true,
    },
    'custom:discord_avatar': {
      dataType: 'String',
      mutable: true,
    },
  },
  multifactor: {
    mode: 'off',
  },
  passwordPolicy: {
    minLength: 12,
    requireLowercase: false,
    requireUppercase: false,
    requireNumbers: false,
    requireSymbols: false,
  },
});
