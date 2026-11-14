import { unstable_cache } from 'next/cache';
import catalog from '../../../public/data/pokemon.json';
import bootstrap from '../../data/official-events.json';
import calendarSnapshot from '../../data/calendar-events.json';
import { EVENTS } from '../eventCatalog';
import { mergeEvents, retainedServerEvents, type CalendarSnapshot, type EventFeed } from '../events';
import type { PokemonCatalogEntry } from '../../types/pokemon';
import { importOfficialEvents, mergeOfficialEvents, OfficialSourceError, officialUrl, officialCalendarUrl } from './officialEvents';

export const EVENTS_CACHE_TAG = 'official-pokemon-go-events';

/** No user cookies or credentials are forwarded to the public source. */
export async function fetchOfficialPage(input: string, signal?: AbortSignal): Promise<string> {
  let url = officialUrl(input);
  if (!url) throw new Error('Fonte de eventos inválida.');
  for (let redirects = 0; redirects < 4; redirects += 1) {
    const response = await fetch(url, {
      redirect: 'manual', cache: 'no-store',
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10_000)]) : AbortSignal.timeout(10_000),
      headers: { 'User-Agent': 'PokeClub/2.0 (public event importer)', Accept: 'text/html', 'Accept-Language': 'pt-BR' },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      url = officialUrl(response.headers.get('location') || '', url);
      if (!url) throw new Error('Redirecionamento da fonte oficial inválido.');
      continue;
    }
    if (!response.ok) throw new OfficialSourceError(response.status, url);
    if (!response.headers.get('content-type')?.includes('text/html')) throw new Error('A fonte oficial não retornou HTML.');
    const html = await response.text();
    if (html.length > 2_000_000) throw new Error('Resposta da fonte oficial acima do limite.');
    return html;
  }
  throw new Error('A fonte oficial excedeu o limite de redirecionamentos.');
}

// Failed refreshes throw instead of caching an empty agenda. Next's Data Cache
// retains the last successful value when background revalidation fails.
const readOfficialFeed = unstable_cache(async () => {
  const signal = AbortSignal.timeout(45_000);
  return importOfficialEvents(url => fetchOfficialPage(url, signal), catalog as PokemonCatalogEntry[], new Date(), calendarSnapshot as CalendarSnapshot);
}, ['official-go-events-calendar-v1', calendarSnapshot.checkedAt], { revalidate: 3600, tags: [EVENTS_CACHE_TAG] });

export async function getEventFeed(): Promise<EventFeed> {
  let feed: EventFeed;
  try {
    feed = await readOfficialFeed();
  } catch (error) {
    console.error('[events] Official synchronization unavailable:', error instanceof Error ? error.message : 'unknown');
    feed = {
      ...bootstrap, calendarUrl: officialCalendarUrl(), health: 'fallback', coverage: 'calendar-snapshot',
      events: mergeOfficialEvents(calendarSnapshot.events as CalendarSnapshot['events'], bootstrap.events as EventFeed['events']),
      diagnostics: { ...bootstrap.diagnostics, calendarCheckedAt: calendarSnapshot.checkedAt, calendarMonths: calendarSnapshot.months },
    } as EventFeed;
  }
  return { ...feed, events: retainedServerEvents(mergeEvents(EVENTS, feed.events), Date.now()) };
}
