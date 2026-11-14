import type { PokedexFilters, PokemonCatalogEntry } from '@/types/pokemon';
import { REGION_RANGES } from '@/types/pokemon';

export function filterCatalog(catalog: PokemonCatalogEntry[], filters: PokedexFilters) {
  const term = filters.searchTerm.trim().toLocaleLowerCase('pt-BR').replace(/^#0*/, '');
  const [min, max] = REGION_RANGES[filters.region];
  const list = catalog.filter(pokemon => pokemon.id >= min && pokemon.id <= max
    && (!term || pokemon.name.toLocaleLowerCase('pt-BR').includes(term) || String(pokemon.id) === term)
    && filters.selectedTypes.every(type => pokemon.types.includes(type))
    && (filters.evolutionStatus === 'ALL' || (filters.evolutionStatus === 'HAS_EVOLUTION' ? pokemon.canEvolve : !pokemon.canEvolve)));
  const direction = filters.sortBy.endsWith('DESC') ? -1 : 1;
  if (filters.sortBy.startsWith('HEIGHT')) list.sort((a, b) => (a.height - b.height) * direction || a.id - b.id);
  if (filters.sortBy.startsWith('WEIGHT')) list.sort((a, b) => (a.weight - b.weight) * direction || a.id - b.id);
  return list;
}
