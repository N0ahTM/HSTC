# HSTC – Helvetic Security & Transport Corporation

An AWS Amplify Gen 2 hosted, Vite-powered React application for the HSTC Star Citizen organization.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: AWS Amplify Gen 2 (TypeScript-based Infrastructure as Code)
- **Styling**: CSS Modules
- **Testing**: Vitest + Testing Library
- **Animations**: Anime.js

## Amplify Gen 2 Architecture

This project uses **Amplify Gen 2**, which provides a modern, TypeScript-first approach to building cloud backends.

### Key Features of Gen 2:
- ✅ **Code-first**: Define infrastructure in TypeScript (no CLI required)
- ✅ **Type-safe**: Full IDE autocomplete and type checking
- ✅ **Git-friendly**: All configuration in version control
- ✅ **CDK-powered**: Built on AWS CDK for extensibility

### Backend Structure

```
amplify/
├── auth/resource.ts      # Cognito authentication
├── data/resource.ts      # AppSync GraphQL API
├── storage/resource.ts   # S3 storage
└── backend.ts           # Main backend definition
```

For detailed backend documentation, see [amplify/README.md](./amplify/README.md).

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS Account (for deploying backend)
- Amplify CLI (optional, for local development)

### Local Development

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

### Backend Development (Optional)

If you want to work with the backend locally:

1. **Navigate to the amplify directory:**
   ```bash
   cd amplify
   npm install
   ```

2. **Start a local sandbox:**
   ```bash
   npx ampx sandbox
   ```

This creates a personal cloud sandbox that syncs with your code changes.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Deployment

The application is automatically deployed via AWS Amplify Hosting when pushing to the connected branch. The deployment process:

1. **Backend**: Amplify automatically detects `amplify/` directory and deploys backend resources
2. **Frontend**: Builds the Vite app and deploys to CloudFront CDN
3. **Configuration**: Generates `amplify_outputs.json` for frontend consumption

See [docs/architecture.md](./docs/architecture.md) for detailed architecture documentation.

## Amplify Gen 1 to Gen 2 Migration

This project has been updated to be **100% compatible with Amplify Gen 2**. Key changes:

| Gen 1 | Gen 2 |
|-------|-------|
| `amplifyconfiguration.json` | `amplify_outputs.json` |
| Amplify CLI (`amplify push`) | TypeScript definitions (`npx ampx deploy`) |
| `aws-exports.js` | `amplify_outputs.json` |
| Manual environment variables | Auto-generated configuration |

## Documentation

- [Architecture](./docs/architecture.md) - System architecture and design
- [Animations](./docs/animations.md) - Animation system documentation
- [Backend Setup](./amplify/README.md) - Amplify Gen 2 backend guide

## License

Private - All rights reserved
