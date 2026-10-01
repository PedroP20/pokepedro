export type EventCategory = { id: string; name: string; icon: string; color: string; pokemonId: number; description: string };

export const EVENT_CATEGORIES: EventCategory[] = [
  { id: 'live', name: 'Acontecendo agora', icon: '●', color: '#a71932', pokemonId: 25, description: 'O momento de jogar é agora' },
  { id: 'max', name: 'Batalhas Max', icon: '✦', color: '#a51b64', pokemonId: 6, description: 'Grandes desafios, grandes encontros' },
  { id: 'community-classic', name: 'Clássicos do Dia Comunitário', icon: '☀', color: '#91610c', pokemonId: 147, description: 'Reencontre seus favoritos' },
  { id: 'super-mega', name: 'Dia de Super Megarreides', icon: '◆', color: '#633caf', pokemonId: 150, description: 'Poder além da Megaevolução' },
  { id: 'scenery', name: 'Domingo de Paisagens', icon: '▧', color: '#247267', pokemonId: 133, description: 'Explore novos cenários' },
  { id: 'general', name: 'Eventos', icon: '⚡', color: '#1B4F9C', pokemonId: 25, description: 'Festivais e aventuras especiais' },
  { id: 'raid-hour', name: 'Hora de Reides', icon: '⚔', color: '#a13c26', pokemonId: 384, description: 'Prepare seu time de batalha' },
  { id: 'spotlight', name: 'Hora de Holofote', icon: '★', color: '#946200', pokemonId: 179, description: 'Um Pokémon no centro das atenções' },
  { id: 'mega', name: 'Megarreides', icon: '◆', color: '#603ba0', pokemonId: 10038, description: 'Encontros com energia Mega' },
  { id: 'go-battle', name: 'Quinta de Batalhas GO', icon: '⚔', color: '#286287', pokemonId: 448, description: 'Seu próximo desafio na Liga' },
  { id: 'five-star', name: 'Reides de Cinco Estrelas', icon: '★', color: '#805014', pokemonId: 249, description: 'Lendas esperam por você' },
  { id: 'shadow', name: 'Reides Sombrosos', icon: '☾', color: '#352b55', pokemonId: 150, description: 'Enfrente o poder das sombras' },
  { id: 'max-monday', name: 'Segunda Max', icon: '✦', color: '#993356', pokemonId: 143, description: 'Comece a semana em tamanho Max' },
  { id: 'friendship', name: 'Sexta da Amizade', icon: '♥', color: '#a03465', pokemonId: 35, description: 'A aventura fica melhor em companhia' },
  { id: 'showcase', name: 'Terça de Vitrine', icon: '♛', color: '#287154', pokemonId: 1, description: 'Seus Pokémon merecem destaque' },
];

// Local timestamps have no offset; absolute timestamps MUST contain Z or an offset.
// Intervals are half-open: start <= now < end. Use multiple windows for daily sessions.
export type EventSchedule = { mode: 'local' | 'absolute'; windows: { start: string; end: string }[]; label?: string };
export type EventPokemon = { id: number; name: string; dexNumber?: number; types?: string[]; shiny?: boolean };
export type GameEvent = {
  id: string; name: string; categoryId: string; summary: string; imageId?: number;
  announced?: string; highlights?: { icon: string; text: string }[];
  sections?: { id: string; icon: string; title: string; description?: string; items: string[]; schedule?: EventSchedule }[];
  schedule?: EventSchedule; pokemon?: EventPokemon[]; featured?: EventPokemon[];
  bonuses?: string[]; raids?: EventPokemon[]; megaRaids?: EventPokemon[];
  fiveStarRaids?: EventPokemon[]; maxBattles?: EventPokemon[];
  research?: string[]; rewards?: string[]; notes?: string[];
  reminder?: { minutesBefore: number }; // Reserved for a future notification provider.
};

export type ResolvedWindow = { start: number; end: number };
export function eventWindows(event: GameEvent): ResolvedWindow[] {
  if (!event.schedule) return [];
  const pattern = event.schedule.mode === 'local'
    ? /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/
    : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/;
  return event.schedule.windows.flatMap(({ start, end }) => {
    if (!pattern.test(start) || !pattern.test(end)) return [];
    // Reject impossible dates and local wall times skipped by daylight saving.
    const valid = (value: string) => {
      const [year, month, day, hour, minute, second = 0] = value.slice(0, 19).split(/[-T:Z+]/).map(Number);
      const calendar = new Date(Date.UTC(year, month - 1, day));
      if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59) return false;
      if (event.schedule!.mode === 'absolute') return true;
      const local = new Date(value);
      return local.getFullYear() === year && local.getMonth() === month - 1 && local.getDate() === day && local.getHours() === hour && local.getMinutes() === minute;
    };
    if (!valid(start) || !valid(end)) return [];
    const a = new Date(start).getTime(), b = new Date(end).getTime();
    return Number.isFinite(a) && Number.isFinite(b) && b > a ? [{ start: a, end: b }] : [];
  }).sort((a, b) => a.start - b.start);
}

export function dayStart(time: number, offset = 0) {
  const date = new Date(time);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset).getTime();
}
export function overlapsDay(event: GameEvent, time: number, offset = 0) {
  return eventWindows(event).some(w => w.start < dayStart(time, offset + 1) && w.end > dayStart(time, offset));
}
export function eventState(event: GameEvent, now: number) {
  const windows = eventWindows(event);
  const active = windows.find(w => w.start <= now && now < w.end);
  const next = windows.find(w => w.start > now);
  const status = active ? 'live' : !windows.length ? 'unscheduled' : !next ? 'ended' : overlapsDay(event, now) ? 'today' : 'upcoming';
  return { status, active, next, windows };
}
export function countdown(milliseconds: number) {
  const minutes = Math.max(1, Math.ceil(milliseconds / 60_000));
  const days = Math.floor(minutes / 1440), hours = Math.floor(minutes % 1440 / 60), rest = minutes % 60;
  return [days ? `${days}d` : '', hours ? `${hours}h` : '', rest ? `${rest}min` : ''].filter(Boolean).join(' ');
}
export const EVENT_FILTERS = [['all', 'Todos'], ['live', 'Ao vivo'], ['today', 'Hoje'], ['tomorrow', 'Amanhã'], ['week', 'Esta semana'], ['upcoming', 'Próximos'], ['ended', 'Encerrados'], ['favorites', 'Meus favoritos']] as const;
export type EventFilter = typeof EVENT_FILTERS[number][0];
export function matchesFilter(event: GameEvent, filter: EventFilter, now: number, favorites: string[]) {
  const state = eventState(event, now);
  switch (filter) {
    case 'live': return state.status === 'live';
    case 'today': return overlapsDay(event, now);
    case 'tomorrow': return overlapsDay(event, now, 1);
    case 'week': {
      const weekday = (new Date(now).getDay() + 6) % 7;
      return state.windows.some(w => w.start < dayStart(now, 7 - weekday) && w.end > dayStart(now, -weekday));
    }
    case 'upcoming': return !!state.next;
    case 'ended': return state.status === 'ended';
    case 'favorites': return favorites.includes(event.id);
    default: return true;
  }
}
export function normalizeSearch(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
export function matchesSearch(event: GameEvent, query: string) {
  const category = EVENT_CATEGORIES.find(c => c.id === event.categoryId);
  return normalizeSearch([event.name, event.summary, category?.name, ...[event.pokemon, event.featured, event.raids, event.megaRaids, event.fiveStarRaids, event.maxBattles].flatMap(group => group?.map(p => p.name) || []), ...(event.sections?.flatMap(section => [section.title, section.description ?? '', ...section.items]) ?? [])].join(' ')).includes(normalizeSearch(query.trim()));
}
export function sortEvents(events: GameEvent[], now: number) {
  return [...events].sort((a, b) => {
    const x = eventState(a, now), y = eventState(b, now);
    return (x.active?.start ?? x.next?.start ?? x.windows[0]?.start ?? Infinity) - (y.active?.start ?? y.next?.start ?? y.windows[0]?.start ?? Infinity);
  });
}
