import { getEventFeed } from '@/lib/server/eventFeed';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  return Response.json(await getEventFeed(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
