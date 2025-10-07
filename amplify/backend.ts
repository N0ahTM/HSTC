import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

/**
 * @see https://docs.amplify.aws/gen2/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
});

// Optionally customize resources using AWS CDK
// const { cfnUserPool } = backend.auth.resources.cfnResources;
// cfnUserPool.policies = {
//   passwordPolicy: {
//     minimumLength: 10,
//   },
// };
