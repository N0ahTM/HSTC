# Discord Aggregate Function Setup & Testing Guide

This guide covers the current backend function in this repo: `discord-aggregate`.

## Scope

Function files:

- `amplify/functions/discord-aggregate/resource.ts`
- `amplify/functions/discord-aggregate/handler.ts`
- wiring in `amplify/backend.ts`

Runtime endpoint:

- `/api/discord-combined` in local dev proxy
- Lambda Function URL in hosted environments

## Prerequisites

- Node.js 22+
- AWS CLI + SSO configured
- Access to Amplify project
- Discord bot token + IDs

## Required Secrets

Set all three:

- `DISCORD_BOT_TOKEN`
- `DISCORD_CHANNEL_ID`
- `DISCORD_GUILD_ID`

Sandbox (example):

```powershell
npx -y -p @aws-amplify/backend-cli@latest ampx sandbox secret set DISCORD_BOT_TOKEN
npx -y -p @aws-amplify/backend-cli@latest ampx sandbox secret set DISCORD_CHANNEL_ID
npx -y -p @aws-amplify/backend-cli@latest ampx sandbox secret set DISCORD_GUILD_ID
```

## Local Testing

Start local function server + frontend:

```bash
npm run dev:full
```

Test events and images:

```bash
curl "http://localhost:5173/api/discord-combined?mode=events&all=1"
curl "http://localhost:5173/api/discord-combined?mode=images&limit=10"
curl "http://localhost:5173/api/discord-combined?mode=both&limit=10"
```

Expected response shape:

```json
{
  "events": { "...": "..." },
  "images": { "...": "..." },
  "meta": { "cache": "HIT|MISS|STALE", "fetchedAt": "..." }
}
```

## Hosted Testing

When deployed, use the combined endpoint from `amplify_outputs.json` (`custom.discordCombinedUrl`) and run:

```bash
curl "<endpoint>?mode=events&all=1"
curl "<endpoint>?mode=images&limit=10"
```

## Troubleshooting

- `500 Discord configuration missing`: one of the three secrets is missing.
- `429`: Discord API rate limited; function retries with backoff.
- empty images: verify channel has image attachments or image embeds.

See also:
- `scripts/test-discord-function.ts`
- `scripts/test-discord-events-function.ts`
- `scripts/list-discord-events.ts`
