import 'dotenv/config';
import { handler } from '../amplify/functions/discord-events/handler';

async function main() {
  const event = {
    requestContext: { http: { method: 'GET' } },
    queryStringParameters: { debug: '1' }
  } as const;

  const res = await handler(event as any);
  console.log('status:', res.statusCode);
  console.log('headers:', res.headers);
  try {
    const body = JSON.parse(res.body);
    console.log('meta:', body.meta);
    if (body.payload) {
      console.log('counts:', {
        upcoming: body.payload.upcoming?.length,
        active: body.payload.active?.length,
        past: body.payload.past?.length,
        rawCount: body.payload.rawCount
      });
    }
    if (body.meta) {
      console.log('meta:', body.meta);
    }
    if (body.missingEnv) {
      console.log('missingEnv:', body.missingEnv);
    }
    if (body.error && body.meta?.debugInfo) {
      console.log('debugInfo:', body.meta.debugInfo);
    }
  } catch (e) {
    console.log('raw body:', res.body);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
