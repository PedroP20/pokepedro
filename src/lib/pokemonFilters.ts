// src/lib/pokemonFilters.ts
import { Region, REGION_RANGES } from "@/types/pokemon";
import { LEGENDARY_IDS, MYTHICAL_IDS, ULTRA_BEAST_IDS, PARADOX_IDS } from "./pokemonConstants";
import { fetchIdsByType } from "@/queries/pokeApi";

export interface FilterOptions {
  region: Region;
  selectedTypes: string[];
  onlyLegendaries: boolean;
  onlyMythicals: boolean;
  onlyUltraBeasts: boolean;
  onlyParadox: boolean;
}

export async function generateFilteredQueue(options: FilterOptions, allMasterIds: number[]): Promise<number[]> {
  let validIds = [...allMasterIds];

  // 1. Filtro por Região
  if (options.region !== "ALL") {
    const [min, max] = REGION_RANGES[options.region];
    validIds = validIds.filter(id => id >= min && id <= max);
  }

  // 2. Filtro por Tipos
  if (options.selectedTypes.length > 0) {
    const typeArrays = await Promise.all(
      options.selectedTypes.map(type => fetchIdsByType(type))
    );
    const allowedTypeIds = new Set(typeArrays.flat());
    validIds = validIds.filter(id => allowedTypeIds.has(id));
  }

  // 3. Filtros de Categorias Especiais
  if (options.onlyLegendaries) {
    validIds = validIds.filter(id => LEGENDARY_IDS.includes(id));
  }
  if (options.onlyMythicals) {
    validIds = validIds.filter(id => MYTHICAL_IDS.includes(id));
  }
  if (options.onlyUltraBeasts) {
    validIds = validIds.filter(id => ULTRA_BEAST_IDS.includes(id));
  }
  if (options.onlyParadox) {
    validIds = validIds.filter(id => PARADOX_IDS.includes(id));
  }

  return validIds;
}