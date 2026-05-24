import 'dotenv/config';
import { handler } from '../amplify/functions/discord-aggregate/handler.ts';

async function main() {
  const event = {
    requestContext: { http: { method: 'GET' } },
    queryStringParameters: { mode: 'events', all: '1', debug: '1' }
  } as const;

  const res = await handler(event as Parameters<typeof handler>[0]);
  console.log('status:', res.statusCode);
  console.log('headers:', res.headers);
  try {
    const body = JSON.parse(res.body);
    console.log('meta:', body.meta);
    if (body.events) {
      console.log('counts:', {
        upcoming: body.events.upcoming?.length,
        active: body.events.active?.length,
        past: body.events.past?.length,
        rawCount: body.events.rawCount
      });
    }
    if (body.meta) {
      console.log('meta:', body.meta);
    }
    if (body.details?.missingEnv) {
      console.log('missingEnv:', body.details.missingEnv);
    }
    if (body.error && body.meta?.debugInfo) {
      console.log('debugInfo:', body.meta.debugInfo);
    }
  } catch {
    console.log('raw body:', res.body);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
