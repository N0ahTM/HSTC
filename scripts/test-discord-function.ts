import 'dotenv/config';
import { handler } from '../amplify/functions/discord-images/handler';

async function main() {
  const event = {
    requestContext: { http: { method: 'GET' } },
    queryStringParameters: { limit: '3' }
  } as const;

  const res = await handler(event as any);
  console.log('status:', res.statusCode);
  console.log('headers:', res.headers);
  try {
    const body = JSON.parse(res.body);
    console.log('keys:', Object.keys(body));
    console.log('page:', body.page);
    console.log('meta:', body.meta);
    if (Array.isArray(body.data)) {
      console.log('items:', body.data.length);
      console.log('first:', body.data[0]);
    }
  } catch (e) {
    console.log('raw body:', res.body);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
