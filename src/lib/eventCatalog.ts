import type { GameEvent } from './events';
import { GIBLE_COMMUNITY_CLASSIC } from './eventGible';
import { STARAPTOR_SUPER_MEGA } from './eventStaraptor';
import { SCENERY_SUNDAYS, GOFEST_PHASES, MEGA_SQUADS, HORIZONS, PHANTUMP_CATCH_MASTERY } from './eventsSeptember';
import { SEPTEMBER_ROTATIONS } from './eventRotationsSeptember';

// Register only existing content and event information supplied by the user.
export const EVENTS: GameEvent[] = [...GOFEST_PHASES, {
  id: 'max-eevee-2026-09', name: 'Dinamax Eevee — Batalhas Max', categoryId: 'max', imageId: 133,
  summary: 'Encontre Dinamax Eevee nas Batalhas Max de 31 de agosto a 6 de setembro.',
  schedule: { mode: 'local', label: '31/08 a 06/09, até 23:59 · horário local', windows: [{ start: '2026-08-31T00:00', end: '2026-09-07T00:00' }] },
  maxBattles: [{ id: 133, name: 'Dinamax Eevee', dexNumber: 133, types: ['Normal'] }],
}, {
  id: 'max-ralts-2026-09', name: 'Dinamax Ralts — Batalhas Max', categoryId: 'max', imageId: 280,
  summary: 'Encontre Dinamax Ralts nas Batalhas Max de 7 a 13 de setembro.',
  schedule: { mode: 'local', label: '07/09 a 13/09, até 23:59 · horário local', windows: [{ start: '2026-09-07T00:00', end: '2026-09-14T00:00' }] },
  maxBattles: [{ id: 280, name: 'Dinamax Ralts', dexNumber: 280, types: ['Psíquico', 'Fada'] }],
}, {
  id: 'max-rhyhorn-2026-09', name: 'Dinamax Rhyhorn — Batalhas Max', categoryId: 'max', imageId: 111,
  summary: 'Encontre Dinamax Rhyhorn nas Batalhas Max de 14 a 20 de setembro.',
  schedule: { mode: 'local', label: '14/09 a 20/09, até 23:59 · horário local', windows: [{ start: '2026-09-14T00:00', end: '2026-09-21T00:00' }] },
  maxBattles: [{ id: 111, name: 'Dinamax Rhyhorn', dexNumber: 111, types: ['Terrestre', 'Pedra'] }],
}, {
  id: 'max-aves-lendarias-2026-09', name: 'Dinamax Articuno, Zapdos e Moltres — Batalhas Max', categoryId: 'max', imageId: 144,
  summary: 'Dinamax Articuno, Zapdos e Moltres em destaque nas Batalhas Max de 21 a 27 de setembro.',
  schedule: { mode: 'local', label: '21/09 a 27/09, até 23:59 · horário local', windows: [{ start: '2026-09-21T00:00', end: '2026-09-28T00:00' }] },
  featured: [
    { id: 144, name: 'Dinamax Articuno', dexNumber: 144, types: ['Gelo', 'Voador'] },
    { id: 145, name: 'Dinamax Zapdos', dexNumber: 145, types: ['Elétrico', 'Voador'] },
    { id: 146, name: 'Dinamax Moltres', dexNumber: 146, types: ['Fogo', 'Voador'] },
  ],
  maxBattles: [
    { id: 144, name: 'Dinamax Articuno', dexNumber: 144, types: ['Gelo', 'Voador'] },
    { id: 145, name: 'Dinamax Zapdos', dexNumber: 145, types: ['Elétrico', 'Voador'] },
    { id: 146, name: 'Dinamax Moltres', dexNumber: 146, types: ['Fogo', 'Voador'] },
  ],
}, {
  id: 'max-sobble-2026-09', name: 'Dinamax Sobble — Batalhas Max', categoryId: 'max', imageId: 816,
  summary: 'Encontre Dinamax Sobble nas Batalhas Max de 28 de setembro a 4 de outubro.',
  schedule: { mode: 'local', label: '28/09 a 04/10, até 23:59 · horário local', windows: [{ start: '2026-09-28T00:00', end: '2026-10-05T00:00' }] },
  maxBattles: [{ id: 816, name: 'Dinamax Sobble', dexNumber: 816, types: ['Água'] }],
}, GIBLE_COMMUNITY_CLASSIC, STARAPTOR_SUPER_MEGA, ...SCENERY_SUNDAYS, MEGA_SQUADS, HORIZONS, PHANTUMP_CATCH_MASTERY, ...SEPTEMBER_ROTATIONS];
