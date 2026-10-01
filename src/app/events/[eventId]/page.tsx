import { notFound } from 'next/navigation';
import { EVENTS } from '@/lib/eventCatalog';
import EventDetails from '@/components/events/EventDetails';
import GoFestExperience from '@/components/gofest/GoFestExperience';
import '../events.css';

export default async function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = EVENTS.find(item => item.id === eventId);
  if (!event) notFound();
  if (eventId === 'mega-ascensao') return <GoFestExperience key={eventId} phase="ASCENSION" />;
  if (eventId === 'megafinal-2026') return <GoFestExperience key={eventId} phase="FINAL" />;
  return <EventDetails event={event} />;
}
