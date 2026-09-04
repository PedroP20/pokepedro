export type Region = 
  | "ALL" 
  | "KANTO" 
  | "JOHTO" 
  | "HOENN" 
  | "SINNOH" 
  | "UNOVA" 
  | "KALOS" 
  | "ALOLA" 
  | "GALAR" 
  | "HISUI"
  | "PALDEA";

export type OrderType = "RANDOM" | "POKEDEX";

export type GameStatus = "IDLE" | "PLAYING" | "ANSWERED" | "FINISHED";

export const REGION_RANGES: Record<Region, [number, number]> = {
  ALL: [1, 1025],
  KANTO: [1, 151],
  JOHTO: [152, 251],
  HOENN: [252, 386],
  SINNOH: [387, 493],
  UNOVA: [494, 649],
  KALOS: [650, 721],
  ALOLA: [722, 809],
  GALAR: [810, 898],
  HISUI: [899, 905],
  PALDEA: [906, 1025],
};

export interface PokemonOption {
  id: number;
  name: string;
}

export interface EvolutionNode {
  id: number;
  name: string;
  spriteUrl: string;
}

export interface EvolutionTreeNode extends EvolutionNode {
  /** Condições para chegar a este Pokémon a partir do nó anterior. */
  conditions: string[];
  evolvesTo: EvolutionTreeNode[];
}

// 🧬 ESTRUTURA PARA FORMAS ALTERNATIVAS E MEGAS
export interface PokemonVariety {
  name: string;
  slug: string;
  id: number;
  formType: "NORMAL" | "MEGA" | "GIGANTAMAX" | "DYNAMAX" | "REGIONAL" | "ALTERNATIVE";
}

export interface PokemonDetails {
  id: number;
  name: string;
  spriteUrl: string;
  artworkUrl: string;
  hasShinyArtwork: boolean;
  types: string[];
  height: number;
  weight: number;
  generation: string;
  region: string;
  isLegendary: boolean;
  isMythic: boolean;
  flavorText: string;
  evolutions: EvolutionNode[];
  evolutionTree: EvolutionTreeNode | null;
  canEvolve: boolean;
  varieties: PokemonVariety[]; // 👈 Lista de formas (Mega, G-Max, Alola, etc.)
  hasGenderDifferences: boolean; // 👈 Diferença Macho/Fêmea
}

// ⚙️ ESTRUTURA DOS FILTROS DEFINITIVOS
export interface PokedexFilters {
  searchTerm: string;
  region: Region;
  selectedTypes: string[];
  sortBy: "ID" | "HEIGHT_ASC" | "HEIGHT_DESC" | "WEIGHT_ASC" | "WEIGHT_DESC";
  evolutionStatus: "ALL" | "HAS_EVOLUTION" | "NO_EVOLUTION";
}

export interface PokemonFormData {
  id: number;
  name: string;
  spriteUrl: string;
  artworkUrl: string;
  hasShinyArtwork: boolean;
  types: string[];
  height: number;
  weight: number;
}
