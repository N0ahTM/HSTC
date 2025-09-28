import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure authentication for the HSTC application
 * This includes user registration, login, password reset, and user attributes
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      // Enable email verification
      verificationEmailStyle: 'code',
      verificationEmailSubject: 'HSTC - Verifiziere deine E-Mail-Adresse',
      verificationEmailBody: (createCode) =>
        `Willkommen bei HSTC! Verwende diesen Code zur Verifizierung: ${createCode()}`,
    },
    // Optional: Add phone number login
    phone: false,
  },
  userAttributes: {
    // Standard attributes
    email: {
      required: true,
      mutable: true,
    },
    // Custom attributes for HSTC
    'custom:organization_role': {
      dataType: 'String',
      mutable: true,
    },
    'custom:pilot_call_sign': {
      dataType: 'String', 
      mutable: true,
    },
    'custom:join_date': {
      dataType: 'DateTime',
      mutable: false,
    },
    'custom:ship_preference': {
      dataType: 'String',
      mutable: true,
    },
    'custom:preferred_language': {
      dataType: 'String',
      mutable: true,
    },
  },
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: false,
  },
  accountRecovery: 'email',
  multifactor: {
    mode: 'optional',
    totp: true,
    sms: false,
  },
});