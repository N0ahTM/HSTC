import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'hstcStorage',
  access: (allow) => ({
    // Public access for organization resources
    'public/organization/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
    ],
    
    // Public images and assets that anyone can view
    'public/images/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],

    // Public documents like manuals, guides
    'public/documents/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['officers', 'admins']).to(['write', 'delete']),
    ],

    // Mission briefings - authenticated users only
    'missions/briefings/*': [
      allow.authenticated.to(['read']),
      allow.groups(['officers', 'admins']).to(['read', 'write', 'delete']),
    ],

    // Mission reports and logs
    'missions/reports/*': [
      allow.authenticated.to(['read', 'write']),
      allow.groups(['officers', 'admins']).to(['read', 'write', 'delete']),
    ],

    // Private pilot files - each pilot can only access their own
    'pilots/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.groups(['admins']).to(['read', 'write', 'delete']),
    ],

    // Ship documentation and blueprints
    'fleet/ships/*': [
      allow.authenticated.to(['read']),
      allow.groups(['engineers', 'officers', 'admins']).to(['read', 'write', 'delete']),
    ],

    // Administrative files - admins only
    'admin/*': [
      allow.groups(['admins']).to(['read', 'write', 'delete']),
    ],

    // Temporary uploads for processing
    'temp/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],

    // Organization logos, banners, promotional materials
    'assets/branding/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['admins']).to(['read', 'write', 'delete']),
    ],

    // Event screenshots, videos, media
    'events/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.authenticated.to(['read']),
      allow.groups(['officers', 'admins']).to(['read', 'write', 'delete']),
    ],

    // Training materials and certifications
    'training/*': [
      allow.authenticated.to(['read']),
      allow.groups(['instructors', 'officers', 'admins']).to(['read', 'write', 'delete']),
    ],
  }),
});