import { timingSafeEqual } from 'node:crypto';
import { getEventFeed } from '@/lib/server/eventFeed';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const received = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret ?? ''}`);
  if (!secret || received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const feed = await getEventFeed();
  return Response.json({ updatedAt: feed.updatedAt, count: feed.events.length, health: feed.health }, {
    status: feed.health === 'ok' ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
