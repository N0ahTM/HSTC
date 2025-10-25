import 'dotenv/config';

type LambdaHandler = (event: {
  requestContext: { http: { method: string } };
  queryStringParameters?: Record<string, string | undefined>;
}) => Promise<{
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}>;

interface CliOptions {
  mode?: 'both' | 'images' | 'events';
  limit?: number;
  before?: string;
  all?: boolean;
  debug?: boolean;
}

async function loadHandler(): Promise<LambdaHandler> {
  const mod = await import('../amplify/functions/discord-aggregate/handler');
  return mod.handler;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { mode: 'both' };
  for (const arg of argv) {
    if (arg.startsWith('--mode=')) {
      const [, value] = arg.split('=');
      if (value === 'images' || value === 'events' || value === 'both') {
        options.mode = value;
      }
      continue;
    }
    if (arg.startsWith('--limit=')) {
      const [, value] = arg.split('=');
      const parsed = Number.parseInt(value, 10);
      if (!Number.isNaN(parsed)) {
        options.limit = parsed;
      }
      continue;
    }
    if (arg.startsWith('--before=')) {
      const [, value] = arg.split('=');
      options.before = value;
      continue;
    }
    if (arg === '--all') {
      options.all = true;
      continue;
    }
    if (arg === '--debug') {
      options.debug = true;
    }
  }
  return options;
}

function buildQuery(options: CliOptions): Record<string, string> {
  const query: Record<string, string> = {};
  if (options.limit) {
    query.limit = String(options.limit);
  }
  if (options.before) {
    query.before = options.before;
  }
  if (options.mode) {
    query.mode = options.mode;
  }
  if (options.all) {
    query.all = '1';
  }
  if (options.debug) {
    query.debug = '1';
  }
  return query;
}

function logResponseBody(body: unknown) {
  if (!body || typeof body !== 'object') {
    console.log('body:', body);
    return;
  }
  console.log('body keys:', Object.keys(body as Record<string, unknown>));
  if ('events' in body && body.events && typeof body.events === 'object') {
    const events = body.events as {
      upcoming?: unknown[];
      active?: unknown[];
      past?: unknown[];
      rawCount?: number;
      guildId?: string;
    };
    console.log('events summary:', {
      guildId: events.guildId,
      upcoming: events.upcoming?.length ?? 0,
      active: events.active?.length ?? 0,
      past: events.past?.length ?? 0,
      rawCount: events.rawCount
    });
  }

  if ('images' in body && body.images && typeof body.images === 'object') {
    const images = body.images as {
      data?: unknown[];
      page?: { nextBefore?: string; hasMore?: boolean };
      meta?: unknown;
    };
    console.log('images summary:', {
      count: images.data?.length ?? 0,
      nextBefore: images.page?.nextBefore,
      hasMore: images.page?.hasMore,
      meta: images.meta
    });
  }

  if ('meta' in body) {
    console.log('meta:', (body as Record<string, unknown>).meta);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const handler = await loadHandler();

  const event = {
    requestContext: { http: { method: 'GET' } },
    queryStringParameters: buildQuery(options)
  } as const;

  const result = await handler(event as any);
  console.log('status:', result.statusCode);
  console.log('headers:', result.headers);
  try {
    const json = JSON.parse(result.body) as unknown;
    logResponseBody(json);
  } catch (error) {
    console.warn('failed to parse JSON body:', error);
    console.log('raw body:', result.body);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
