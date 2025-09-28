import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates the HSTC database schema with multiple models
=========================================================================*/
const schema = a.schema({
  // Pilot Profile Model
  Pilot: a
    .model({
      callSign: a.string().required(),
      email: a.email().required(),
      organizationRole: a.enum(['Recruit', 'Member', 'Officer', 'Leader', 'Admiral']),
      joinDate: a.datetime(),
      shipPreference: a.string(),
      preferredLanguage: a.enum(['DE', 'CH', 'AT']),
      isActive: a.boolean().default(true),
      totalFlightHours: a.integer().default(0),
      missionCount: a.integer().default(0),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(['admins']).to(['read', 'update', 'delete']),
      allow.authenticated().to(['read']),
    ]),

  // Mission Model
  Mission: a
    .model({
      title: a.string().required(),
      description: a.string(),
      missionType: a.enum(['Combat', 'Transport', 'Exploration', 'Trading', 'Rescue']),
      status: a.enum(['Planned', 'Active', 'Completed', 'Cancelled']).default('Planned'),
      difficulty: a.enum(['Easy', 'Medium', 'Hard', 'Extreme']),
      startDate: a.datetime(),
      endDate: a.datetime(),
      maxParticipants: a.integer().default(10),
      currentParticipants: a.integer().default(0),
      location: a.string(),
      reward: a.float(),
      requirements: a.string(),
      briefing: a.string(),
      createdBy: a.string().required(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.groups(['officers', 'admins']).to(['create', 'update', 'delete']),
    ]),

  // Ship Registry Model
  Ship: a
    .model({
      name: a.string().required(),
      manufacturer: a.string(),
      model: a.string(),
      shipClass: a.enum(['Fighter', 'Transport', 'Capital', 'Industrial', 'Explorer']),
      owner: a.string(),
      crew: a.integer().default(1),
      cargo: a.integer().default(0),
      status: a.enum(['Active', 'Maintenance', 'Destroyed', 'Stored']).default('Active'),
      lastMaintenance: a.datetime(),
      insuranceStatus: a.boolean().default(false),
      modifications: a.string(),
      purchaseDate: a.datetime(),
      purchasePrice: a.float(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
      allow.groups(['admins']).to(['create', 'update', 'delete']),
    ]),

  // Event/Operations Log Model
  OperationLog: a
    .model({
      missionId: a.id(),
      pilotId: a.id(),
      shipId: a.id(),
      eventType: a.enum(['Mission_Start', 'Mission_Complete', 'Combat_Engagement', 'Trade_Complete', 'Emergency']),
      timestamp: a.datetime().required(),
      location: a.string(),
      description: a.string(),
      outcome: a.enum(['Success', 'Failure', 'Partial']),
      credits: a.float().default(0),
      experience: a.integer().default(0),
      notes: a.string(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['create', 'read']),
      allow.groups(['officers', 'admins']).to(['update', 'delete']),
    ]),

  // Organization News/Announcements Model
  Announcement: a
    .model({
      title: a.string().required(),
      content: a.string().required(),
      priority: a.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
      author: a.string().required(),
      publishDate: a.datetime().required(),
      expiryDate: a.datetime(),
      isPublished: a.boolean().default(false),
      category: a.enum(['General', 'Mission', 'Technical', 'Social', 'Emergency']),
      targetAudience: a.enum(['All', 'Members', 'Officers', 'Admins']).default('All'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.groups(['officers', 'admins']).to(['create', 'update', 'delete']),
    ]),

  // Fleet Status Model
  FleetStatus: a
    .model({
      totalShips: a.integer().default(0),
      activeShips: a.integer().default(0),
      inMaintenanceShips: a.integer().default(0),
      totalPilots: a.integer().default(0),
      activePilots: a.integer().default(0),
      onlinePilots: a.integer().default(0),
      activeMissions: a.integer().default(0),
      completedMissions: a.integer().default(0),
      totalCredits: a.float().default(0),
      lastUpdated: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.groups(['admins']).to(['create', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    // API Key auth for public access (if needed)
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});