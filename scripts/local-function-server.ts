import 'dotenv/config';
import http from 'node:http';
import { URL } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';

// Import the handler directly from the backend function
import { handler } from '../amplify/functions/discord-images/handler';

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

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Only handle our API route; return 404 for others
  if (url.pathname !== '/api/discord-images') {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  try {
    const event = buildEvent(req, url);
    const lambdaRes = await handler(event as any);
    writeResponse(res, lambdaRes.statusCode, lambdaRes.headers, lambdaRes.body);
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
  console.log(`Local function server listening on http://localhost:${PORT}/api/discord-images`);
});
