# Amplify Backend (Current State)

This project uses Amplify Gen 2 with a focused backend scope.

## What exists

```
amplify/
├── backend.ts
└── functions/
    └── discord-aggregate/
        ├── resource.ts
        └── handler.ts
```

- `backend.ts` wires one Lambda function and exposes a Function URL output:
  - `custom.discordCombinedUrl`
- `discord-aggregate/handler.ts` returns Discord events/images data for frontend sections.

## Secrets

Set these as Amplify secrets (not plaintext env vars):

- `DISCORD_BOT_TOKEN`
- `DISCORD_CHANNEL_ID`
- `DISCORD_GUILD_ID`

## Workflow

From repository root:

```bash
npm run sandbox
```

CI/backend deploy happens via `amplify.yml`:

```bash
npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
```

## Output

`amplify_outputs.json` is generated in project root and used by frontend endpoint resolution.

Important:
- keep `amplify_outputs.json` out of git (already in `.gitignore`)
- `amplify_outputs.example.json` is only a template

## References

- [Architecture](../docs/architecture.md)
- [Amplify Integration](../docs/amplify-gen2-integration.md)
- [Amplify Gen 2 docs](https://docs.amplify.aws/gen2/)
