import 'dotenv/config';
import http from 'node:http';
import { URL } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';

// Import the handler directly from the backend function
import { handler as aggregateHandler } from '../amplify/functions/discord-aggregate/handler';

const PORT = Number(process.env.FUNCTION_PORT ?? 3000);

function buildEvent(req: IncomingMessage, url: URL) {
  const method = req.method || 'GET';
  const queryStringParameters: Record<string, string | undefined> = {};
  url.searchParams.forEach((value, key) => {
    queryStringParameters[key] = value;
  });

  return {
    requestContext: { http: { method } },
    queryStringParameters
  } as const;
}

function writeResponse(res: ServerResponse, statusCode: number, headers: Record<string, string>, body: string) {
  res.statusCode = statusCode;
  for (const [k, v] of Object.entries(headers)) {
    res.setHeader(k, v);
  }
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.statusCode = 400;
    res.end('Bad Request');
    return;
  }

  const url = new URL(req.url, `https://dwvzp4itkvcxlfpqv7elwljq6u.appsync-api.eu-central-1.amazonaws.com/graphql`);

  // Only handle our API route; return 404 for others
  try {
    if (url.pathname === '/api/discord-combined') {
      const event = buildEvent(req, url);
      const lambdaRes = await aggregateHandler(event as any);
      writeResponse(res, lambdaRes.statusCode, lambdaRes.headers, lambdaRes.body);
      return;
    }
    res.statusCode = 404;
    res.end('Not Found');
  } catch (err) {
    console.error('Handler error:', err);
    writeResponse(
      res,
      500,
      { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      JSON.stringify({ error: 'Internal Server Error' })
    );
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Local function server listening at http://localhost:${PORT}/api/discord-combined`);
});
