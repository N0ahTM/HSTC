import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Define your data schema
 * @see https://docs.amplify.aws/gen2/build-a-backend/data
 */
const schema = a.schema({
  Prospect: a
    .model({
      email: a.string().required(),
      username: a.string(),
      message: a.string(),
      status: a.string().default('pending'),
      submittedAt: a.datetime(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
