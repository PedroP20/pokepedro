import { load, type CheerioAPI } from 'cheerio';
import { EVENT_CATEGORIES, type CalendarSnapshot, type EventFeed, type EventPokemon, type EventSchedule, type GameEvent, normalizeSearch, eventWindows, mergeEvents, retainedServerEvents } from '../events';
import type { PokemonCatalogEntry } from '../../types/pokemon';

export const OFFICIAL_NEWS_URL = 'https://pokemongo.com/pt-BR/news';
export class OfficialSourceError extends Error {
  constructor(public status: number, url: string) {
    super(`Fonte oficial indisponível (${status}): ${url}`);
    this.name = 'OfficialSourceError';
  }
}
const OFFICIAL_HOSTS = new Set(['pokemongo.com', 'pokemongolive.com', 'www.pokemongolive.com']);
const IMAGE_HOSTS = new Set(['lh3.googleusercontent.com', 'storage.googleapis.com', 'images.ctfassets.net', 'assets.pgo.gamesite.scopelyexplore.com', ...OFFICIAL_HOSTS]);
const MONTHS = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const ENGLISH_MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const clean = (value: string) => value.replace(/\s+/g, ' ').trim();
type JsonObject = Record<string, unknown>;
const object = (value: unknown): JsonObject => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};

export function officialCalendarUrl(now = new Date()) {
  return `https://pokemongo.com/pt-BR/events/${ENGLISH_MONTHS[now.getUTCMonth()]}-${now.getUTCFullYear()}`;
}

export function officialUrl(input: string, base = OFFICIAL_NEWS_URL): string | null {
  try {
    const url = new URL(input, base);
    if (url.protocol !== 'https:' || !OFFICIAL_HOSTS.has(url.hostname) || url.username || url.password || url.port) return null;
    url.pathname = url.pathname.replace(/^\/pt_BR\//, '/pt-BR/');
    if (url.pathname.startsWith('/news/')) url.pathname = `/pt-BR${url.pathname}`;
    if (/^\/pt-BR\/news\/[^/]+\/$/.test(url.pathname)) url.pathname = url.pathname.slice(0, -1);
    url.search = ''; url.hash = '';
    return url.toString();
  } catch { return null; }
}

export function officialImageUrl(input: string): string | null {
  try {
    const url = new URL(input);
    return url.protocol === 'https:' && IMAGE_HOSTS.has(url.hostname) && !url.username && !url.password && !url.port ? url.toString() : null;
  } catch { return null; }
}

function structuredData($: CheerioAPI) {
  const result: JsonObject[] = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    const data = object(value);
    if (Object.keys(data).length) result.push(data);
    if (data['@graph']) visit(data['@graph']);
  };
  $('script[type="application/ld+json"]').each((_, element) => {
    try { visit(JSON.parse($(element).text())); } catch { /* Ignore unrelated malformed JSON-LD. */ }
  });
  return result;
}

export function parseNewsIndex(html: string) {
  const $ = load(html);
  const urls = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value !== 'string') return;
    const url = officialUrl(value);
    if (url && /^\/pt-BR\/news\/[^/]+\/?$/.test(new URL(url).pathname)) urls.add(url);
  };
  structuredData($).filter(data => data['@type'] === 'ItemList').forEach(data => {
    if (Array.isArray(data.itemListElement)) data.itemListElement.forEach(item => add(object(item).url));
  });
  $('main a[href]').each((_, element) => add($(element).attr('href')));
  if (!urls.size) throw new Error('A lista de anúncios oficiais mudou de formato ou está indisponível.');
  return [...urls];
}

export function classifyEvent(title: string) {
  const text = normalizeSearch(title);
  const rules: [RegExp, string][] = [
    [/super\s*mega|super-mega/, 'super-mega'],
    [/comunitario.*classico|classico.*comunitario|community.*classic/, 'community-classic'],
    [/dia comunitario|community day/, 'community'],
    [/segunda max|max monday/, 'max-monday'],
    [/dia.*batalhas? max|max battle day/, 'max-day'],
    [/batalhas? max|dinamax|gigamax|dynamax|gigantamax/, 'max'],
    [/hora de reides|raid hour/, 'raid-hour'],
    [/holofote|spotlight/, 'spotlight'],
    [/dia.*megarreides|mega raid day/, 'mega'],
    [/dia.*(?:megarreides|reides)|raid day/, 'raid-day'],
    [/megarreides|mega raids?/, 'mega'],
    [/reides? sombr|shadow raids?/, 'shadow'],
    [/cinco estrelas|five.star/, 'five-star'],
    [/dia de chocar|hatch day/, 'hatch'],
    [/mestre da captura|catch mastery/, 'catch-mastery'],
    [/domingo de paisagens/, 'scenery'],
    [/quinta.*batalhas go/, 'go-battle'],
    [/sexta.*amizade/, 'friendship'],
    [/terca.*vitrine/, 'showcase'],
  ];
  return rules.find(([pattern]) => pattern.test(text))?.[1] ?? 'general';
}

function wallTime(year: number, month: number, day: number, hour: number, minute: number) {
  const date = new Date(Date.UTC(year, month, day, hour, minute));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day || hour > 23 || minute > 59) return null;
  return date.toISOString().slice(0, 16);
}

function readHour(value: string) {
  if (/meia[ -]noite/.test(value)) return { hour: 0, minute: 0 };
  const match = value.match(/(?:^|\s)(\d{1,2})(?:h(\d{2})?|:(\d{2}))(?:\s|,|$)/);
  return match ? { hour: Number(match[1]), minute: Number(match[2] ?? match[3] ?? 0) } : null;
}

/** Parse the published event interval, never the article's publication date. */
export function parsePortugueseSchedule(value: string, publicationYear: number): EventSchedule | null {
  const text = normalizeSearch(clean(value));
  const dates = [...text.matchAll(/(\d{1,2})[ºªo]?\s+de\s+(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+de\s+(\d{4}))?/g)];
  if (!dates.length || dates.length > 2) return null;
  const year = Number(dates.find(date => date[3])?.[3] ?? publicationYear);
  if (!Number.isInteger(year) || year < 2020 || year > 2100) return null;
  const first = dates[0], last = dates.at(-1)!;
  const firstMonth = MONTHS.indexOf(first[2]), lastMonth = MONTHS.indexOf(last[2]);
  const crossesYear = dates.length === 2 && firstMonth > lastMonth;
  const firstYear = Number(first[3] ?? (last[3] ? Number(last[3]) - (crossesYear ? 1 : 0) : publicationYear));
  const lastYear = Number(last[3] ?? firstYear + (crossesYear ? 1 : 0));
  if (firstYear < 2020 || firstYear > 2100 || lastYear < 2020 || lastYear > 2100) return null;
  let startHour, endHour;
  if (dates.length === 2) {
    startHour = readHour(text.slice(first.index! + first[0].length, last.index));
    endHour = readHour(text.slice(last.index! + last[0].length));
  } else {
    const tail = text.slice(first.index! + first[0].length);
    const hours = tail.split(/\s+(?:as|a|ate)\s+/);
    startHour = readHour(hours[0]); endHour = readHour(hours.slice(1).join(' '));
  }
  const dateOnly = !startHour && !endHour;
  if (!dateOnly && (!startHour || !endHour || !/horario local|horario de brasilia/.test(text))) return null;
  let start = wallTime(firstYear, firstMonth, Number(first[1]), startHour?.hour ?? 0, startHour?.minute ?? 0);
  let end = wallTime(lastYear, lastMonth, Number(last[1]), endHour?.hour ?? 0, endHour?.minute ?? 0);
  if (!start || !end) return null;
  if (dateOnly || (endHour?.hour === 23 && endHour.minute === 59)) {
    end = new Date(Date.parse(`${end}Z`) + (dateOnly ? 86_400_000 : 60_000)).toISOString().slice(0, 16);
  }
  if (/horario de brasilia/.test(text)) { start += '-03:00'; end += '-03:00'; }
  if (Date.parse(end + (end.includes('-03:00') ? '' : 'Z')) <= Date.parse(start + (start.includes('-03:00') ? '' : 'Z'))) return null;
  return { mode: text.includes('horario de brasilia') ? 'absolute' : 'local', windows: [{ start, end }], label: clean(value), ...(dateOnly ? { dateOnly: true } : {}) };
}

type Section = NonNullable<GameEvent['sections']>[number];
function readSections($: CheerioAPI, title: string) {
  const sections: Section[] = [];
  let current: Section | null = { id: 'official-introduction', icon: '✦', title, items: [] };
  sections.push(current);
  $('article').first().find('h2, h3, p, li').each((_, element) => {
    const node = $(element), tag = element.tagName;
    const readable = node.clone();
    if (tag === 'li') readable.find('ul, ol').remove();
    readable.find('br').replaceWith(' ');
    readable.find('strong, b, span').after(' ');
    const value = clean(readable.text());
    if (!value || value.length > 2400) return;
    if (tag === 'h2' || tag === 'h3') {
      current = { id: `official-section-${sections.length + 1}`, icon: '✦', title: value, items: [] };
      sections.push(current); return;
    }
    if (!current || (tag === 'p' && node.parents('li').length)) return;
    if (/siga-nos|a equipe do pokemon go|preste(?:m)? atencao ao seu entorno/i.test(normalizeSearch(value))) return;
    if (!current.items.includes(value)) current.items.push(value);
  });
  return sections.filter(section => section.items.length).slice(0, 35);
}

function pokemonFromText(text: string, catalog: PokemonCatalogEntry[]): EventPokemon[] {
  const normalized = ` ${normalizeSearch(text).replace(/[^a-z0-9]+/g, ' ')} `;
  return catalog.filter(pokemon => normalized.includes(` ${normalizeSearch(pokemon.name).replace(/[^a-z0-9]+/g, ' ')} `))
    .map(pokemon => ({ id: pokemon.id, name: pokemon.name, types: pokemon.types })).slice(0, 40);
}

export function parseNewsArticle(html: string, sourceUrl: string, catalog: PokemonCatalogEntry[], checkedAt: string): GameEvent | null {
  const safeUrl = officialUrl(sourceUrl);
  if (!safeUrl) return null;
  const $ = load(html);
  const metadata = structuredData($).find(data => data['@type'] === 'NewsArticle' || data['@type'] === 'Article');
  if (!metadata || !metadata.headline || !$('article').length) return null;
  const title = clean(String(metadata.headline));
  const sections = readSections($, title);
  const publishedAt = String(metadata.datePublished ?? '');
  const publicationYear = Number(publishedAt.slice(0, 4));
  // The primary interval is in the event introduction. Later paragraphs may
  // describe ticket sales or research deadlines and must not replace it.
  const candidates = sections[0]?.id === 'official-introduction' ? sections.slice(0, 2) : sections.slice(0, 1);
  const introduction = candidates.find(section => section.items.some(text => parsePortugueseSchedule(text, publicationYear)));
  const intervals: EventSchedule[] = [];
  let intervalYear = publicationYear;
  let previousMonth = -1;
  for (const text of introduction?.items ?? []) {
    let interval = parsePortugueseSchedule(text, intervalYear);
    if (!interval) continue;
    const start = interval.windows[0].start;
    const month = Number(start.slice(5, 7));
    // Upcoming sessions listed October → December → May continue into the
    // next year. Explicit years always override this chronological context.
    if (previousMonth > month && !/\b20\d{2}\b/.test(text)) {
      interval = parsePortugueseSchedule(text, intervalYear + 1);
      if (!interval) continue;
    }
    intervalYear = Number(interval.windows[0].start.slice(0, 4));
    previousMonth = month;
    intervals.push(interval);
  }
  const schedule = intervals.length ? { ...intervals[0], windows: intervals.flatMap(interval => interval.windows), dateOnly: intervals.every(interval => interval.dateOnly) } : null;
  if (!schedule) return null;
  const categoryId = classifyEvent(title);
  const category = EVENT_CATEGORIES.find(item => item.id === categoryId)!;
  const featured = pokemonFromText(title, catalog);
  const rosterSections = sections.filter(section => /encontros|pokemon|reides|batalhas max|ovos/i.test(normalizeSearch(section.title)));
  const pokemon = pokemonFromText(rosterSections.map(section => section.items.join(' ')).join(' '), catalog);
  const images: NonNullable<GameEvent['images']> = [];
  const addImage = (input: unknown, alt = title) => {
    if (typeof input !== 'string') return;
    const url = officialImageUrl(input);
    if (url && !images.some(image => image.url.split('=')[0] === url.split('=')[0])) images.push({ url, alt: clean(alt) || title });
  };
  const metaImage = Array.isArray(metadata.image) ? metadata.image[0] : metadata.image;
  addImage(typeof metaImage === 'object' ? object(metaImage).url : metaImage);
  $('article img').each((_, element) => {
    const node = $(element);
    if (node.closest('a[href="/pt-BR/news"]').length) return;
    addImage(node.attr('src'), node.attr('alt'));
  });
  const detailSections = sections.map(section => {
    const sectionSchedule = section.items.map(item => parsePortugueseSchedule(item, publicationYear)).find(Boolean);
    return { ...section, ...(sectionSchedule ? { schedule: sectionSchedule } : {}) };
  });
  const slug = new URL(safeUrl).pathname.split('/').filter(Boolean).at(-1)!;
  return {
    id: `official-${slug}`, name: introduction?.id === 'official-introduction' ? title : clean($('article h2').first().text()) || title, categoryId,
    summary: `${category.name}. ${featured.length ? `${featured.map(item => item.name).join(', ')} em destaque. ` : ''}Confira a programação e os detalhes do anúncio oficial.`,
    schedule, announced: /^\d{4}-\d{2}-\d{2}/.test(publishedAt) ? publishedAt.slice(0, 10) : undefined,
    sections: detailSections, featured, pokemon: pokemon.filter(item => !featured.some(highlight => highlight.id === item.id)), imageId: featured[0]?.id ?? pokemon[0]?.id,
    images: images.slice(0, 24),
    source: { name: 'Pokémon GO', url: safeUrl, kind: 'news', checkedAt },
  };
}

const OFFICIAL_TOPICS: Record<number, string> = {
  1: 'general', 2: 'max', 3: 'mega', 4: 'shadow', 5: 'five-star', 6: 'community',
  9: 'hatch', 13: 'super-mega', 16: 'max-day', 19: 'max-monday', 21: 'raid-hour',
  22: 'spotlight', 23: 'showcase', 24: 'go-battle', 25: 'friendship', 26: 'scenery',
};

/** Select event fields only: never serialize player location, RSVPs or account data. */
export function parseCalendarRecords(records: unknown[], sourceUrl: string, checkedAt: string, catalog: PokemonCatalogEntry[] = []): GameEvent[] {
  const safeSource = officialUrl(sourceUrl);
  if (!safeSource || !/\/pt-BR\/events\/[a-z]+-\d{4}$/.test(new URL(safeSource).pathname)) return [];
  const result: GameEvent[] = [];
  for (const record of records) {
    const data = object(record), topic = object(data.eventType);
    const id = String(data.eventId ?? '');
    const topicId = Number(topic.eventTypeId ?? topic.id);
    const name = typeof data.title === 'string' ? clean(data.title) : '';
    const startMs = Number(data.startTimeUnixMs), endMs = Number(data.endTimeUnixMs);
    if (!/^[a-z0-9_-]{1,80}$/i.test(id) || !name || name.length > 500 || !Number.isSafeInteger(startMs) || !Number.isSafeInteger(endMs) || startMs < Date.UTC(2020, 0) || endMs >= Date.UTC(2101, 0) || endMs <= startMs) continue;
    const start = new Date(startMs).toISOString().slice(0, 16);
    // The calendar renders these epoch fields as wall times in the trainer's
    // timezone. 23:59 is an inclusive last minute in its UI; ours is half-open.
    const inclusiveEnd = new Date(endMs).toISOString().slice(11, 16) === '23:59';
    const end = new Date(endMs + (inclusiveEnd ? 60_000 : 0)).toISOString().slice(0, 16);
    const topicName = typeof topic.name === 'string' ? clean(topic.name).slice(0, 200) : '';
    const categoryId = OFFICIAL_TOPICS[topicId] ?? (Number.isSafeInteger(topicId) && topicId > 0 ? `official-type-${topicId}` : classifyEvent(name));
    const categoryName = EVENT_CATEGORIES.find(item => item.id === categoryId)?.name ?? (topicName || 'Eventos');
    const images: NonNullable<GameEvent['images']> = [];
    const addImage = (value: unknown, alt: string) => {
      const url = typeof value === 'string' ? officialImageUrl(value) : null;
      if (url && !images.some(image => image.url === url)) images.push({ url, alt });
    };
    addImage(data.imageUrl, name);
    const entries = data.pokemon ?? object(data.campfireLiveEvent).pokemonImageEntries;
    const featured: EventPokemon[] = [];
    if (Array.isArray(entries)) for (const entry of entries) {
      const pokemon = object(entry);
      const label = typeof pokemon.nameKey === 'string' ? clean(pokemon.nameKey).slice(0, 200) : '';
      addImage(pokemon.imageUrl, label || name);
      const normalized = normalizeSearch(label);
      const exact = catalog.find(item => normalizeSearch(item.name) === normalized);
      const dexId = typeof pokemon.imageUrl === 'string' ? Number(pokemon.imageUrl.match(/\/pm(\d+)(?:[._])/i)?.[1]) : NaN;
      const base = exact ?? catalog.find(item => item.id === dexId);
      if (base && !featured.some(item => item.id === base.id && item.name === label)) featured.push({ id: base.id, name: label || base.name, ...(exact ? { types: exact.types } : {}), ...(base.id <= 1025 ? { dexNumber: base.id } : {}) });
    }
    const url = typeof data.blogUrl === 'string' && data.blogUrl ? officialUrl(data.blogUrl) : null;
    result.push({
      id: `official-calendar-${id}`, name, categoryId, summary: `${categoryName}. Confira a programação confirmada no calendário oficial.`,
      ...(url ? { aliases: [`official-${new URL(url).pathname.split('/').filter(Boolean).at(-1)}`] } : {}),
      officialTopic: Number.isSafeInteger(topicId) && topicId > 0 ? { id: topicId, name: topicName || categoryName } : undefined,
      schedule: { mode: 'local', windows: [{ start, end }] }, featured, imageId: featured[0]?.id, images,
      source: { name: 'Pokémon GO', url: url ?? safeSource, kind: 'calendar', checkedAt },
    });
  }
  return result;
}

/** Decode JSON carried in the document; never execute the source's scripts. */
function calendarDocumentData($: CheerioAPI) {
  const chunks: string[] = [];
  $('script').each((_, element) => {
    const match = $(element).text().match(/self\.__next_f\.push\((\[[\s\S]*\])\)/);
    if (!match) return;
    try { const value = JSON.parse(match[1]); if (typeof value[1] === 'string') chunks.push(value[1]); } catch { /* Other scripts are not event data. */ }
  });
  const calendars: JsonObject[] = [], slugs = new Set<string>();
  const visit = (value: unknown, depth = 0) => {
    if (!value || typeof value !== 'object' || depth > 80) return;
    const data = object(value);
    const calendar = object(data.calendarEvents);
    if (Array.isArray(calendar.events)) calendars.push(calendar);
    for (const key of ['prevMonthSlug', 'nextMonthSlug']) {
      if (typeof data[key] === 'string' && /^[a-z]+-\d{4}$/.test(data[key] as string)) slugs.add(data[key] as string);
    }
    Object.values(value).forEach(child => visit(child, depth + 1));
  };
  for (const line of chunks.join('').split('\n')) {
    const match = line.match(/^[0-9a-f]+:([\[{].*)$/);
    if (match) try { visit(JSON.parse(match[1])); } catch { /* Non-JSON RSC frames are unrelated. */ }
  }
  return { calendars, slugs };
}

export function parseCalendar(html: string, sourceUrl: string, checkedAt: string, catalog: PokemonCatalogEntry[] = []) {
  const $ = load(html);
  const requiresLogin = /faca login.*(?:ver eventos|pokemon go)/.test(normalizeSearch($('main').text() || $('body').text()));
  if (requiresLogin) return { events: [] as GameEvent[], requiresLogin: true, nextUrls: [] as string[] };
  const { calendars, slugs } = calendarDocumentData($);
  const nextUrls = new Set([...slugs].map(slug => `https://pokemongo.com/pt-BR/events/${slug}`));
  $('main a[href]').each((_, element) => {
    const url = officialUrl($(element).attr('href') ?? '', sourceUrl);
    if (url && /\/pt-BR\/events\/[a-z]+-\d{4}$/.test(new URL(url).pathname)) nextUrls.add(url);
  });
  const events = structuredData($).filter(data => ['Event', 'SportsEvent'].includes(String(data['@type']))).flatMap(data => {
    const start = typeof data.startDate === 'string' ? data.startDate.replace(/\.\d+(?=Z|[+-])/, '') : '';
    const end = typeof data.endDate === 'string' ? data.endDate.replace(/\.\d+(?=Z|[+-])/, '') : '';
    if (!start || !end || !data.name || !Number.isFinite(Date.parse(start)) || Date.parse(end) <= Date.parse(start)) return [];
    const absolute = /(Z|[+-]\d\d:\d\d)$/.test(start) && /(Z|[+-]\d\d:\d\d)$/.test(end);
    if (!absolute && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(start) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(end))) return [];
    if (!eventWindows({ schedule: { mode: absolute ? 'absolute' : 'local', windows: [{ start, end }] } } as GameEvent).length) return [];
    const name = clean(String(data.name));
    const url = officialUrl(String(data.url || sourceUrl))!;
    const slug = normalizeSearch(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const image = officialImageUrl(String(data.image ?? ''));
    return [{ id: `official-calendar-${slug}-${start.slice(0, 10)}`, name, categoryId: classifyEvent(name), summary: clean(String(data.description ?? 'Consulte os detalhes no calendário oficial.')), schedule: { mode: absolute ? 'absolute' : 'local', windows: [{ start, end }] }, source: { name: 'Pokémon GO', url: url || sourceUrl, kind: 'calendar', checkedAt }, ...(image ? { images: [{ url: image, alt: name }] } : {}) } as GameEvent];
  });
  const records = calendars.flatMap(calendar => Array.isArray(calendar.events) ? calendar.events : []);
  return { events: mergeEvents(events, parseCalendarRecords(records, sourceUrl, checkedAt, catalog)), requiresLogin: false, nextUrls: [...nextUrls] };
}

const articleKey = (event: GameEvent) => {
  const url = event.source && officialUrl(event.source.url);
  return url && /^\/pt-BR\/news\/[^/]+\/?$/.test(new URL(url).pathname) ? new URL(url).pathname.replace(/\/$/, '') : null;
};

/** Combine one calendar occurrence with its article without merging recurring events. */
export function mergeOfficialEvents(calendar: GameEvent[], news: GameEvent[]) {
  const consumed = new Set<string>();
  const unified = mergeEvents(calendar).map(event => {
    const key = articleKey(event);
    if (!key) return event;
    const detail = news.find(item => articleKey(item) === key && item.schedule?.mode === event.schedule?.mode &&
      item.schedule!.windows.some(a => event.schedule!.windows.some(b => a.start < b.end && a.end > b.start)));
    if (!detail) return event;
    consumed.add(detail.id);
    // The article supplies precise event hours, bonuses and research deadlines;
    // the calendar supplies the official topic and occurrence identity.
    const matchesDays = detail.schedule!.windows.length === event.schedule!.windows.length && detail.schedule!.windows.every(a => event.schedule!.windows.some(b => a.start.slice(0, 10) === b.start.slice(0, 10) && Math.abs(Date.parse(`${a.end}Z`) - Date.parse(`${b.end}Z`)) < 86_400_000));
    return {
      ...detail, ...event,
      name: detail.name,
      aliases: [detail.id],
      summary: detail.summary, announced: detail.announced, sections: detail.sections,
      schedule: matchesDays && !detail.schedule!.dateOnly ? detail.schedule : event.schedule,
      pokemon: detail.pokemon, featured: event.featured?.length ? event.featured : detail.featured,
      imageId: event.imageId ?? detail.imageId,
      images: [...(event.images ?? []), ...(detail.images ?? []).filter(image => !event.images?.some(existing => existing.url === image.url))],
    };
  });
  return [...unified, ...mergeEvents(news).filter(event => !consumed.has(event.id))];
}

type FetchPage = (url: string) => Promise<string>;
export async function importOfficialEvents(fetchPage: FetchPage, catalog: PokemonCatalogEntry[], now = new Date(), savedCalendar?: CalendarSnapshot): Promise<EventFeed> {
  const checkedAt = now.toISOString();
  const calendarUrl = officialCalendarUrl(now);
  const pending = [calendarUrl, ...(savedCalendar?.months ?? []).map(month => `https://pokemongo.com/pt-BR/events/${month}`)];
  const visited = new Set<string>(), calendarMonths = new Set<string>();
  const calendarEvents: GameEvent[] = [];
  let calendarRequiresLogin = false, calendarFailures = 0;
  while (pending.length) {
    const url = pending.shift()!;
    if (visited.has(url) || !officialUrl(url) || !/\/events\/[a-z]+-\d{4}$/.test(new URL(url).pathname)) continue;
    visited.add(url);
    try {
      const parsed = parseCalendar(await fetchPage(url), url, checkedAt, catalog);
      calendarRequiresLogin ||= parsed.requiresLogin;
      if (parsed.events.length) {
        calendarEvents.push(...parsed.events);
        calendarMonths.add(new URL(url).pathname.split('/').at(-1)!);
      }
      // Follow published navigation only, including months beyond the current
      // one. A login screen terminates that branch instead of guessing URLs.
      pending.push(...parsed.nextUrls.filter(next => !visited.has(next)));
    } catch { calendarFailures += 1; }
  }
  const retainedCalendar = retainedServerEvents(mergeEvents(savedCalendar?.events ?? [], calendarEvents), now.getTime());
  const linksByArticle = new Map<string, string>();
  for (const url of [...parseNewsIndex(await fetchPage(OFFICIAL_NEWS_URL)), ...retainedCalendar.flatMap(event => articleKey(event) && event.source ? [event.source.url] : [])]) {
    const key = new URL(url).pathname.replace(/\/$/, '');
    if (!linksByArticle.has(key)) linksByArticle.set(key, url);
  }
  const links = [...linksByArticle.values()];
  const events: GameEvent[] = [];
  let skipped = 0;
  const unavailableArticles = new Set<string>();
  // Bounded batches keep the origin load and the function duration predictable.
  for (let offset = 0; offset < links.length; offset += 4) {
    const batch = await Promise.all(links.slice(offset, offset + 4).map(async url => {
      try { return parseNewsArticle(await fetchPage(url), url, catalog, checkedAt); }
      catch (error) {
        // An unpublished/removed article must not hide the calendar occurrence.
        // Network errors still preserve the previous successful cached feed.
        if (error instanceof OfficialSourceError && [404, 410].includes(error.status)) { unavailableArticles.add(new URL(url).pathname.replace(/\/$/, '')); return null; }
        throw error;
      }
    }));
    batch.forEach(event => { if (event) events.push(event); else skipped += 1; });
  }
  if (!events.length && !retainedCalendar.length) throw new Error('Nenhum evento reconhecido nos anúncios oficiais. A sincronização anterior foi preservada.');
  const snapshotUsed = retainedCalendar.some(event => !calendarEvents.some(current => current.id === event.id));
  const allMonths = [...new Set([...calendarMonths, ...(snapshotUsed ? savedCalendar?.months ?? [] : [])])].sort((a, b) => {
    const date = (month: string) => { const [name, year] = month.split('-'); return Number(year) * 12 + ENGLISH_MONTHS.indexOf(name); };
    return date(a) - date(b);
  });
  return {
    events: mergeOfficialEvents(retainedCalendar.map(event => event.source && unavailableArticles.has(articleKey(event) ?? '') ? { ...event, source: { ...event.source, url: calendarUrl } } : event), events), updatedAt: checkedAt, sourceUrl: OFFICIAL_NEWS_URL, calendarUrl,
    coverage: snapshotUsed ? 'calendar-snapshot' : calendarEvents.length ? 'calendar' : 'public-announcements', health: 'ok', retentionDays: 7,
    diagnostics: { discovered: links.length, imported: events.length, skipped, calendarRequiresLogin, calendarFailures,
      calendarMonths: allMonths, calendarImported: retainedCalendar.length, unavailableArticles: unavailableArticles.size,
      calendarCheckedAt: snapshotUsed ? savedCalendar?.checkedAt : calendarEvents.length ? checkedAt : undefined },
  };
}



