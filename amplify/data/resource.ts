import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Member: a
    .model({
      ownerId: a.string().required(),
      discordId: a.string().required(),
      discordUsername: a.string().required(),
      discordAvatar: a.string(),
      ingameHandle: a.string().required(),
      motto: a.string(),
      biography: a.string(),
      activities: a.string().array().default([]),
      roles: a.string().array().default([]),
      ships: a.hasMany('Ship', 'memberId'),
      timezone: a.string(),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
      isAdmin: a.boolean().default(false),
    })
    .identifier(['discordId'])
    .authorization((allow) => [
      allow.owner({ ownerField: 'ownerId' }).to(['read', 'update']),
      allow.groups(['admins']).to(['read', 'update', 'delete', 'create']),
      allow.authenticated().to(['read']),
      allow.apiKey().to(['read']),
    ]),

  Ship: a
    .model({
      memberId: a.id().required(),
      ownerId: a.string().required(),
      member: a.belongsTo('Member', 'memberId'),
      name: a.string().required(),
      manufacturer: a.string(),
      model: a.string(),
      focus: a.string(),
      availability: a.enum(['MISSION', 'ALWAYS', 'SITUATIONAL']).default('MISSION'),
      roleTag: a.string(),
      crew: a.integer().default(1),
      hangarLocation: a.string(),
      notes: a.string(),
    })
    .authorization((allow) => [
      allow.owner({ ownerField: 'ownerId' }).to(['create', 'read', 'update', 'delete']),
      allow.groups(['admins']).to(['create', 'read', 'update', 'delete']),
      allow.apiKey().to(['read']),
    ]),

  NewsEntry: a
    .model({
      slug: a.string().required(),
      title: a.string().required(),
      summary: a.string(),
      content: a.string().required(),
      visibility: a.enum(['PUBLIC', 'MEMBERS']).default('PUBLIC'),
      authorId: a.string().required(),
      authorName: a.string(),
      publishedAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
    })
    .identifier(['slug'])
    .authorization((allow) => [
      allow.apiKey().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['admins']).to(['create', 'update', 'delete']),
    ]),

  Event: a
    .model({
      slug: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      visibility: a.enum(['PUBLIC', 'MEMBERS']).default('PUBLIC'),
      location: a.string(),
      voiceChannel: a.string(),
      startsAt: a.datetime().required(),
      endsAt: a.datetime(),
      createdById: a.string().required(),
      createdByName: a.string(),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
    })
    .identifier(['slug'])
    .authorization((allow) => [
      allow.apiKey().to(['read']),
      allow.authenticated().to(['read']),
      allow.groups(['admins']).to(['create', 'update', 'delete']),
    ]),

  DiscordWidgetCache: a
    .model({
      id: a.string().required(),
      payload: a.string().required(),
      expiresAt: a.datetime().required(),
    })
    .identifier(['id'])
    .authorization((allow) => [
      allow.groups(['admins']).to(['create', 'update', 'delete', 'read']),
      allow.apiKey().to(['read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
