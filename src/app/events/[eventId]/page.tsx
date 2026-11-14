import { notFound } from 'next/navigation';
import { getEventFeed } from '@/lib/server/eventFeed';

import EventDetails from '@/components/events/EventDetails';
import GoFestExperience from '@/components/gofest/GoFestExperience';
import '../events.css';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export default async function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { events } = await getEventFeed();
  const event = events.find(item => item.id === eventId || item.aliases?.includes(eventId));
  if (!event) notFound();
  if (eventId === 'mega-ascensao') return <GoFestExperience key={eventId} phase="ASCENSION" />;
  if (eventId === 'megafinal-2026') return <GoFestExperience key={eventId} phase="FINAL" />;
  return <EventDetails event={event} />;
}
