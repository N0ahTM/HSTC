# Amplify Gen 2 Integration Guide (Current Project)

This document describes the integration that exists today in this repository.

## Current Backend Scope

The project currently integrates one Amplify Gen 2 function:

- `amplify/functions/discord-aggregate/handler.ts`
- Function URL published via `amplify/backend.ts`
- Frontend reads endpoint from `amplify_outputs.json` (`custom.discordCombinedUrl`)

There is no active Cognito/AppSync/Data/Storage integration in this codebase.

## Local Workflow

1. Install dependencies:

```bash
npm install
```

2. Start Amplify sandbox (optional, cloud-backed):

```bash
npm run sandbox
```

3. Run frontend with local function proxy:

```bash
npm run dev:full
```

## Frontend Endpoint Resolution

`src/config/amplifyOutputs.ts` resolves in this order:

1. `VITE_DISCORD_COMBINED_ENDPOINT`
2. Local dev proxy (`/api/discord-combined`) when `VITE_USE_LOCAL_DISCORD_API=true`
3. Build-time `amplify_outputs.json`
4. Runtime `/amplify_outputs.json`
5. `VITE_DISCORD_COMBINED_FALLBACK`

## Required Secrets

Set in Amplify secrets/sandbox secrets:

- `DISCORD_BOT_TOKEN`
- `DISCORD_CHANNEL_ID`
- `DISCORD_GUILD_ID`

## CI/Hosting Integration

- Build/deploy pipeline: `amplify.yml`
- Redirect sync script: `scripts/apply-amplify-redirects.mjs`
- Redirect source file: `amplify-redirects.json`
- Security/cache headers source: `customHttp.yml`

## Common Checks

```bash
npm run lint
npm run build
npm run test:function
```

## References

- [Architecture](./architecture.md)
- [AWS CLI + Sandbox (DE)](./aws-cli-und-sandbox-setup.md)
- [Discord Function Setup](./discord-images-function-setup.md)
