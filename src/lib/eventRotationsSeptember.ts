import { EVENT_CATEGORIES, type EventPokemon, type GameEvent } from './events';

const p = (id: number, name: string): EventPokemon => ({ id, name });
const zacian = [p(888, 'Zacian')], zamazenta = [p(889, 'Zamazenta')], xerneas = [p(716, 'Xerneas')];
const ultraBeasts = [p(794, 'Buzzwole'), p(795, 'Pheromosa'), p(796, 'Xurkitree')];

function event(id: string, categoryId: string, start: string, end: string, featured: EventPokemon[] = [], title?: string): GameEvent {
  const category = EVENT_CATEGORIES.find(c => c.id === categoryId)!;
  const names = featured.map(pokemon => pokemon.name).join(', ');
  const date = start.slice(0, 10).split('-').reverse().join('/');
  return {
    id, categoryId, name: title ?? (names ? `${names} — ${category.name}` : `${category.name} — ${date}`),
    summary: names ? `${names} em destaque. Consulte o período e prepare-se para ${category.name.toLocaleLowerCase('pt-BR')}.` : 'Confira a data e participe no horário local. Os demais detalhes serão informados posteriormente.',
    schedule: { mode: 'local', windows: [{ start, end }] },
    imageId: featured[0]?.id, featured,
    highlights: featured.length ? featured.map(pokemon => ({ icon: category.icon, text: pokemon.name })) : [{ icon: category.icon, text: category.name }],
  };
}

// End is exclusive: a period supplied through 23:59 includes that entire minute.
export const SEPTEMBER_ROTATIONS: GameEvent[] = [
  event('hora-reides-zacian-2026-09', 'raid-hour', '2026-09-09T18:00', '2026-09-09T19:00', zacian),
  event('hora-reides-zamazenta-2026-09', 'raid-hour', '2026-09-16T18:00', '2026-09-16T19:00', zamazenta),
  event('hora-reides-ultracriaturas-2026-09', 'raid-hour', '2026-09-23T18:00', '2026-09-23T19:00', ultraBeasts),
  event('hora-reides-xerneas-2026-09', 'raid-hour', '2026-09-30T18:00', '2026-09-30T19:00', xerneas),

  event('holofote-weedle-2026-09', 'spotlight', '2026-09-10T18:00', '2026-09-10T19:00', [p(13, 'Weedle'), p(14, 'Kakuna'), p(15, 'Beedrill')]),
  event('holofote-houndour-2026-09', 'spotlight', '2026-09-13T18:00', '2026-09-13T19:00', [p(228, 'Houndour'), p(229, 'Houndoom')]),
  event('holofote-rattata-2026-09', 'spotlight', '2026-09-24T18:00', '2026-09-24T19:00', [p(19, 'Rattata')]),

  event('mega-gyarados-2026-09', 'mega', '2026-09-07T00:00', '2026-09-09T00:00', [p(10041, 'Mega Gyarados')]),
  event('mega-beedrill-2026-09', 'mega', '2026-09-08T00:00', '2026-09-16T00:00', [p(10090, 'Mega Beedrill')]),
  event('mega-houndoom-2026-09', 'mega', '2026-09-11T00:00', '2026-09-16T00:00', [p(10048, 'Mega Houndoom')]),
  event('mega-venusaur-2026-09', 'mega', '2026-09-16T00:00', '2026-09-23T00:00', [p(10033, 'Mega Venusaur')]),
  { ...event('mega-malamar-2026-09', 'mega', '2026-09-23T00:00', '2026-09-30T00:00', [p(687, 'Mega Malamar')]), notes: ['A arte e a entrada da Pokédex representam Malamar em sua forma normal. O evento é de Mega Malamar.'] },
  { ...event('mega-victreebel-2026-09', 'mega', '2026-09-30T00:00', '2026-10-07T00:00', [p(71, 'Mega Victreebel')]), notes: ['A arte e a entrada da Pokédex representam Victreebel em sua forma normal. O evento é de Mega Victreebel.'] },

  ...[10, 17, 24].map(day => event(`quinta-batalhas-go-2026-09-${day}`, 'go-battle', `2026-09-${day}T00:00`, `2026-09-${day + 1}T00:00`)),

  event('cinco-estrelas-regis-2026-09', 'five-star', '2026-09-07T00:00', '2026-09-09T00:00', [p(377, 'Regirock'), p(378, 'Regice'), p(379, 'Registeel')]),
  event('cinco-estrelas-zacian-2026-09', 'five-star', '2026-09-09T00:00', '2026-09-16T00:00', zacian),
  event('cinco-estrelas-zamazenta-2026-09', 'five-star', '2026-09-16T00:00', '2026-09-23T00:00', zamazenta),
  event('cinco-estrelas-ultracriaturas-2026-09', 'five-star', '2026-09-23T00:00', '2026-09-30T00:00', ultraBeasts),
  event('cinco-estrelas-xerneas-2026-09', 'five-star', '2026-09-30T00:00', '2026-10-07T00:00', xerneas),

  event('sombrosos-giratina-2026-09', 'shadow', '2026-09-07T00:00', '2026-09-09T00:00', [p(487, 'Giratina')]),
  event('sombrosos-thundurus-2026-09', 'shadow', '2026-09-09T00:00', '2026-10-07T00:00', [p(642, 'Thundurus')]),

  event('segunda-max-ralts-2026-09', 'max-monday', '2026-09-07T06:00', '2026-09-07T21:00', [p(280, 'Ralts')], 'Segunda Max — Ralts'),
  event('segunda-max-rhyhorn-2026-09', 'max-monday', '2026-09-14T06:00', '2026-09-14T21:00', [p(111, 'Rhyhorn')], 'Segunda Max — Rhyhorn'),
  event('segunda-max-aves-2026-09', 'max-monday', '2026-09-21T06:00', '2026-09-21T21:00', [p(144, 'Articuno'), p(146, 'Moltres'), p(145, 'Zapdos')], 'Segunda Max — Articuno, Moltres e Zapdos'),
  event('segunda-max-sobble-2026-09', 'max-monday', '2026-09-28T06:00', '2026-09-28T21:00', [p(816, 'Sobble')], 'Segunda Max — Sobble'),

  ...[11, 18, 25].map(day => event(`sexta-amizade-2026-09-${day}`, 'friendship', `2026-09-${day}T00:00`, `2026-09-${day + 1}T00:00`)),
  ...[8, 15, 22, 29].map(day => { const date = `2026-09-${String(day).padStart(2, '0')}`; return event(`terca-vitrine-${date}`, 'showcase', `${date}T10:00`, `${date}T20:00`); }),
];
