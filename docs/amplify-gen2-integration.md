# Amplify Gen 2 Integration Guide

This guide explains how to integrate the Amplify Gen 2 backend with the frontend application.

## Current State

The repository is **100% Amplify Gen 2 compatible** with a complete backend structure defined in TypeScript. However, the frontend is currently operating as a static site without active backend integration.

## Backend Structure (Ready to Deploy)

```
amplify/
├── auth/resource.ts      # Cognito authentication configuration
├── data/resource.ts      # AppSync GraphQL API with Prospect model
├── storage/resource.ts   # S3 storage buckets
├── backend.ts           # Main backend definition
├── package.json         # Backend dependencies
└── tsconfig.json        # TypeScript configuration
```

## Activating the Backend

If you are working on Windows and need a full step-by-step guide (German) for AWS CLI SSO and Amplify Sandbox, see: [AWS CLI + Sandbox (DE)](./aws-cli-und-sandbox-setup.md).

### Step 1: Deploy the Backend

The backend will automatically deploy when you push to a branch connected to Amplify Hosting, or you can deploy manually:

```bash
cd amplify
npm install
npx ampx sandbox  # For local development
# or
npx ampx deploy --branch production  # For production
```

### Step 2: Install Frontend Dependencies

Add Amplify libraries to the frontend:

```bash
npm install aws-amplify
```

### Step 3: Configure Amplify in the Frontend

Update `src/main.tsx` to configure Amplify:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

import { App } from './App';
import './styles/global.css';

// Configure Amplify with Gen 2 outputs
Amplify.configure(outputs);

// Rest of main.tsx...
```

### Step 4: Use Amplify Services

#### Authentication Example

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut } from 'aws-amplify/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  return { user, loading, signIn, signOut };
}
```

#### Data (GraphQL) Example

```typescript
// src/api/prospect.ts
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export async function submitProspect(data: {
  email: string;
  username?: string;
  message?: string;
}) {
  try {
    const result = await client.models.Prospect.create({
      email: data.email,
      username: data.username,
      message: data.message,
      submittedAt: new Date().toISOString(),
    });
    return result;
  } catch (error) {
    console.error('Error submitting prospect:', error);
    throw error;
  }
}

export async function listProspects() {
  try {
    const { data: prospects } = await client.models.Prospect.list();
    return prospects;
  } catch (error) {
    console.error('Error listing prospects:', error);
    throw error;
  }
}
```

#### Storage Example

```typescript
// src/utils/storage.ts
import { uploadData, getUrl } from 'aws-amplify/storage';

export async function uploadFile(file: File, path: string) {
  try {
    const result = await uploadData({
      path: `public/${path}`,
      data: file,
      options: {
        contentType: file.type,
      },
    }).result;
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function getFileUrl(path: string) {
  try {
    const url = await getUrl({
      path: `public/${path}`,
    });
    return url.url.toString();
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
}
```

## Gen 2 vs Gen 1 Key Differences

### Configuration
- **Gen 1**: `amplifyconfiguration.json` or `aws-exports.js`
- **Gen 2**: `amplify_outputs.json` (auto-generated)

### Backend Definition
- **Gen 1**: Amplify CLI commands (`amplify add auth`, `amplify push`)
- **Gen 2**: TypeScript files (`defineAuth()`, `defineData()`)

### Deployment
- **Gen 1**: `amplify push` from CLI
- **Gen 2**: `npx ampx deploy` or automatic via Amplify Hosting

### Type Safety
- **Gen 1**: Limited type safety, manual type definitions
- **Gen 2**: Full TypeScript support with generated types

### Library Imports
```typescript
// Gen 1
import { Auth } from 'aws-amplify';
import { API, graphqlOperation } from 'aws-amplify';

// Gen 2
import { signIn, signOut, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
```

## Testing with Backend

When the backend is active, you can run local tests against the sandbox:

```bash
cd amplify
npx ampx sandbox  # Start local backend

# In another terminal
cd ..
npm run dev  # Frontend will connect to sandbox
```

## Security Best Practices

1. **Never commit `amplify_outputs.json`** - It's already in `.gitignore`
2. **Use environment variables** for sensitive configuration
3. **Enable MFA** for production Cognito user pools
4. **Set up API authorization rules** appropriately in `data/resource.ts`
5. **Configure CORS** for your API endpoints
6. **Use IAM roles** for Lambda function permissions

## Resources

- [Amplify Gen 2 Documentation](https://docs.amplify.aws/gen2/)
- [Auth Documentation](https://docs.amplify.aws/gen2/build-a-backend/auth/)
- [Data Documentation](https://docs.amplify.aws/gen2/build-a-backend/data/)
- [Storage Documentation](https://docs.amplify.aws/gen2/build-a-backend/storage/)
- [Migration Guide from Gen 1 to Gen 2](https://docs.amplify.aws/gen2/start/migrate-to-gen2/)
