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

// 🧬 ESTRUTURA PARA FORMAS ALTERNATIVAS E MEGAS
export interface PokemonVariety {
  name: string;
  id: number;
  formType: "NORMAL" | "MEGA" | "GIGANTAMAX" | "DYNAMAX" | "REGIONAL" | "ALTERNATIVE";
}

export interface PokemonDetails {
  id: number;
  name: string;
  spriteUrl: string;
  artworkUrl: string;
  types: string[];
  height: number;
  weight: number;
  generation: string;
  region: string;
  isLegendary: boolean;
  isMythic: boolean;
  flavorText: string;
  evolutions: EvolutionNode[];
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