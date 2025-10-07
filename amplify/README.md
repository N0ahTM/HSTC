# Amplify Gen 2 Backend

This directory contains the Amplify Gen 2 backend definition using TypeScript and AWS CDK.

## Structure

```
amplify/
├── auth/
│   └── resource.ts       # Amazon Cognito authentication configuration
├── data/
│   └── resource.ts       # AWS AppSync GraphQL API and data models
├── storage/
│   └── resource.ts       # Amazon S3 storage buckets
├── backend.ts            # Main backend definition that wires all resources
├── package.json          # Backend dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Key Features

- **Type-safe**: Full TypeScript support with IDE autocomplete
- **Code-first**: Infrastructure as Code using AWS CDK
- **Git-friendly**: All configuration in version control
- **No CLI required**: Define everything in code

## Development Workflow

### Local Development (Sandbox)

```bash
cd amplify
npm install
npx ampx sandbox
```

This creates a personal cloud sandbox for development that auto-updates on file changes.

### Deployment

Amplify Hosting automatically deploys the backend when you push to your connected branch. The deployment is handled by the `amplify.yml` configuration in the root directory.

## Generated Output

When the backend is deployed, it generates `amplify_outputs.json` at the project root. This file contains all the configuration needed by the frontend to connect to AWS services.

**Important**: `amplify_outputs.json` is auto-generated and should be in `.gitignore`.

## Frontend Integration

In your frontend code:

```typescript
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
```

## Resources

- [Amplify Gen 2 Documentation](https://docs.amplify.aws/gen2/)
- [Backend Definition Guide](https://docs.amplify.aws/gen2/build-a-backend/)
- [Data Modeling](https://docs.amplify.aws/gen2/build-a-backend/data/)
- [Authentication](https://docs.amplify.aws/gen2/build-a-backend/auth/)
