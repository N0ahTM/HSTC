# HSTC – Helvetic Security & Transport Corporation

Vite + React website for HSTC with an Amplify Gen 2 backend function for Discord community data.

## Tech Stack

- Frontend: React 18, TypeScript, Vite, CSS Modules, Anime.js
- Backend: Amplify Gen 2 (`amplify/backend.ts`) with one Lambda function (`discord-aggregate`)
- Tooling: ESLint, Prettier, Vitest

## Real Backend Scope

This repository currently ships **one** backend capability:

- `amplify/functions/discord-aggregate/handler.ts`
  - aggregates Discord scheduled events and image channel data
  - exposed via Lambda Function URL
  - endpoint published into `amplify_outputs.json` as `custom.discordCombinedUrl`

There is no Cognito/AppSync/Data/Storage resource definition in this repo.

## Prerequisites

- Node.js 22+ recommended
- npm
- AWS access (for sandbox/deploy only)

## Local Development

```bash
npm install
npm run dev
```

With local function proxy:

```bash
npm run dev:full
```

## Backend / Amplify

Sandbox:

```bash
npm run sandbox
```

Remove sandbox:

```bash
npm run sandbox:remove
```

Required secrets for the aggregate function:

- `DISCORD_BOT_TOKEN`
- `DISCORD_CHANNEL_ID`
- `DISCORD_GUILD_ID`

## Scripts

- `npm run dev` – Vite dev server
- `npm run dev:function` – local Node server for `/api/discord-combined`
- `npm run dev:full` – frontend + local function together
- `npm run build` – typecheck + production build
- `npm run lint` – ESLint for source files
- `npm run apply:redirects` – apply `amplify-redirects.json` via AWS CLI
- `npm run test:function` – invoke local aggregate function test
- `npm run sandbox` – start Amplify Gen 2 sandbox

## Deployment Notes

- Amplify build config: `amplify.yml`
- Redirect rules source of truth: `amplify-redirects.json`
- Runtime backend output file copied to `dist/amplify_outputs.json` by `vite.config.ts`

## Documentation

- [Architecture](./docs/architecture.md)
- [Amplify Integration](./docs/amplify-gen2-integration.md)
- [AWS CLI + Sandbox (DE)](./docs/aws-cli-und-sandbox-setup.md)
- [Discord Function Setup](./docs/discord-images-function-setup.md)
- [Strict Review Findings](./docs/strict-code-review-full.md)

## License

Private – all rights reserved.
