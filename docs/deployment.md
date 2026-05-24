# Deployment Guide

## Overview

This project deploys with Amplify Gen 2 and adds CloudFront/WAF in front of the Discord aggregate Lambda Function URL.

High-level flow:

1. Deploy backend via `ampx pipeline-deploy`.
2. Generate `amplify_outputs.json` with `custom.discordCombinedUrl`.
3. Build frontend via Vite.
4. Publish `dist/` through Amplify Hosting.
5. Sync redirects from `amplify-redirects.json`.

## Amplify Pipeline

Defined in `amplify.yml`:

- backend build: `npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID`
- frontend build: `npm run build`
- frontend post-build: `node scripts/apply-amplify-redirects.mjs`

## API Edge Hardening

`amplify/backend.ts` provisions:

- Lambda Function URL (`discord-aggregate`)
- CloudFront distribution as public API entrypoint
- WAF WebACL with IP rate-based rule

Optional origin guard:

- Set `DISCORD_EDGE_ORIGIN_KEY` at deploy time
- CloudFront sends `x-hstc-edge-key`
- Lambda validates this header and rejects direct origin calls without it

## Asset CDN Migration (S3 + CloudFront)

The app can serve images from CDN without breaking local fallback.

1. Upload assets:

```bash
ASSET_S3_BUCKET=<bucket> ASSET_S3_PREFIX=<optional-prefix> npm run assets:sync
```

2. Set frontend runtime variable:

```bash
VITE_ASSET_CDN_BASE_URL=https://<cloudfront-assets-domain>
```

3. Rebuild/deploy frontend.

Notes:

- App resolves assets from `custom.assetBaseUrl` in `amplify_outputs.json`.
- `VITE_ASSET_CDN_BASE_URL` can override this at build/runtime if required.
- `assets:sync` optionally invalidates CloudFront when `ASSET_CLOUDFRONT_DISTRIBUTION_ID` is set.

## CI Gates

GitHub Actions workflow (`.github/workflows/ci.yml`) enforces:

- `npm run lint`
- `npm run lint:infra`
- `npm run build`
- `npm run perf:lighthouse`

This prevents regressions before merge.
