'use client';
import { useQuery } from '@tanstack/react-query';
import bootstrap from '@/data/official-events.json';
import { EVENTS } from '@/lib/eventCatalog';
import { mergeEvents, retainedEvents, type EventFeed, type GameEvent } from '@/lib/events';

export function useEventFeed(now: number | null, initialEvent?: GameEvent) {
  const query = useQuery<EventFeed>({
    queryKey: ['officialEventFeed'],
    queryFn: async () => {
      const response = await fetch('/api/events', { cache: 'no-store', signal: AbortSignal.timeout(55_000) });
      if (!response.ok) throw new Error('A agenda não pôde ser atualizada.');
      const data = await response.json() as EventFeed;
      if (!Array.isArray(data.events)) throw new Error('Agenda inválida.');
      return data;
    },
    placeholderData: { ...bootstrap, health: 'fallback', events: mergeEvents(EVENTS, bootstrap.events as GameEvent[], initialEvent ? [initialEvent] : []) } as EventFeed,
    staleTime: 60_000,
    refetchInterval: 15 * 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
  return { ...query, events: now === null ? [] : retainedEvents(query.data?.events ?? [], now) };
}

