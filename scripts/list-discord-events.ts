import 'dotenv/config';
import { URL } from 'node:url';

// This script fetches the discord-events function with debug, raw and all flags
// and prints a compact table of upcoming/active/past events.

async function main() {
  const endpoint = process.env.DISCORD_EVENTS_ENDPOINT || process.env.VITE_DISCORD_EVENTS_ENDPOINT;
  if (!endpoint) {
    console.error('No endpoint configured. Set DISCORD_EVENTS_ENDPOINT or VITE_DISCORD_EVENTS_ENDPOINT.');
    process.exit(1);
  }
  const url = new URL(endpoint);
  url.searchParams.set('debug', '1');
  url.searchParams.set('raw', '1');
  url.searchParams.set('all', '1');

  const res = await fetch(url, { method: 'GET' });
  const text = await res.text();
  if (!res.ok) {
    console.error('Request failed', res.status, text);
    process.exit(1);
  }
  const json = JSON.parse(text);
  const payload = json.payload;
  const meta = json.meta;

  console.log('Status:', res.status, 'Cache:', meta?.cache, 'Guild:', payload.guildId, 'RawCount:', payload.rawCount);

  if (!payload.all || payload.all.length === 0) {
    console.log('No events.');
    return;
  }

  // Simple table output
  interface Row { bucket: string; status: string; start: string; end: string; name: string; past: boolean; active: boolean; upcoming: boolean; }
  const rows: Row[] = payload.all.map((e: any): Row => ({
    bucket: e.bucket,
    status: e.status,
    start: e.startsAt,
    end: e.endsAt || '-',
    name: e.name,
    past: !!e.isPast,
    active: !!e.isActive,
    upcoming: !!e.isUpcoming
  }));

  const headers = ['bucket', 'status', 'start', 'end', 'name', 'past', 'active', 'upcoming'];
  const colWidths = headers.map(h => Math.max(h.length, ...rows.map((r) => String((r as any)[h]).length)));

  const formatRow = (vals: any[]) => vals.map((v,i) => String(v).padEnd(colWidths[i])).join('  ');
  console.log(formatRow(headers));
  console.log(colWidths.map(w => '-'.repeat(w)).join('  '));
  rows.forEach((r) => console.log(formatRow(headers.map((h) => (r as any)[h]))));

  if (meta?.rawEvents) {
    console.log('\nRaw events sample (first):');
    console.dir(meta.rawEvents[0], { depth: 4 });
  }
}

main().catch(err => {
  console.error('Script error', err);
  process.exit(1);
});
