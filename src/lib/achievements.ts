import { Region, REGION_RANGES } from "@/types/pokemon";

export type AchievementCategory = "GERAL" | "REGIOES" | "SEQUENCIAS" | "REVISAO" | "DIFICULDADE" | "TIPOS";
export type AchievementTier = "BRONZE" | "PRATA" | "OURO" | "PLATINA";
export type AchievementRarity = "COMUM" | "INCOMUM" | "RARA" | "EPICA" | "LENDARIA";

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  rarity: AchievementRarity;
  points: number;
  icon: string;
  target: number;
  metric: "correct" | "streak" | "unique" | "region-kanto" | "region-johto" | "region-hoenn" | "type-correct";
  secret?: boolean;
}

const tier = (id: string, name: string, description: string, target: number, level: AchievementTier, rarity: AchievementRarity, points: number, metric: AchievementDefinition["metric"], category: AchievementCategory, icon = "🏆"): AchievementDefinition => ({ id, name, description, target, tier: level, rarity, points, metric, category, icon });

export const ACHIEVEMENTS: AchievementDefinition[] = [
  tier("first-correct", "Primeiro Passo", "Acerte seu primeiro Pokémon após o lançamento das Conquistas.", 1, "BRONZE", "COMUM", 10, "correct", "GERAL", "🌟"),
  tier("quiz-master-bronze", "Mestre do Quiz", "Acerte 50 Pokémon.", 50, "BRONZE", "COMUM", 10, "correct", "GERAL"),
  tier("quiz-master-prata", "Mestre do Quiz", "Acerte 250 Pokémon.", 250, "PRATA", "INCOMUM", 25, "correct", "GERAL"),
  tier("quiz-master-ouro", "Mestre do Quiz", "Acerte 1.000 Pokémon.", 1000, "OURO", "RARA", 50, "correct", "GERAL"),
  tier("quiz-master-platina", "Mestre do Quiz", "Acerte 5.000 Pokémon.", 5000, "PLATINA", "LENDARIA", 100, "correct", "GERAL", "💎"),
  tier("streak-5", "Sem Errar", "Alcance uma sequência de 5 acertos.", 5, "BRONZE", "COMUM", 10, "streak", "SEQUENCIAS", "🔥"),
  tier("streak-10", "Sem Errar", "Alcance uma sequência de 10 acertos.", 10, "PRATA", "INCOMUM", 25, "streak", "SEQUENCIAS", "🔥"),
  tier("streak-25", "Memória Afiada", "Alcance uma sequência de 25 acertos.", 25, "OURO", "RARA", 50, "streak", "SEQUENCIAS", "⚡"),
  tier("streak-50", "Memória Perfeita", "Alcance uma sequência de 50 acertos.", 50, "PLATINA", "LENDARIA", 100, "streak", "SEQUENCIAS", "💫"),
  tier("kanto-collector", "Conhecedor de Kanto", "Acerte 151 Pokémon diferentes de Kanto.", 151, "OURO", "EPICA", 50, "region-kanto", "REGIOES", "🔴"),
  tier("johto-collector", "Conhecedor de Johto", "Acerte 100 Pokémon diferentes de Johto.", 100, "OURO", "EPICA", 50, "region-johto", "REGIOES", "🟡"),
  tier("hoenn-collector", "Conhecedor de Hoenn", "Acerte 135 Pokémon diferentes de Hoenn.", 135, "OURO", "EPICA", 50, "region-hoenn", "REGIOES", "🟢"),
  tier("unique-100", "Explorador da Pokédex", "Acerte 100 Pokémon diferentes.", 100, "PRATA", "INCOMUM", 25, "unique", "GERAL", "📖"),
  tier("unique-500", "Enciclopédia Viva", "Acerte 500 Pokémon diferentes.", 500, "PLATINA", "LENDARIA", 100, "unique", "GERAL", "📚"),
  tier("type-25", "Especialista em Tipos", "Acerte 25 desafios de tipos.", 25, "BRONZE", "COMUM", 10, "type-correct", "TIPOS", "🎯"),
  tier("type-100", "Mestre dos Tipos", "Acerte 100 desafios de tipos.", 100, "OURO", "RARA", 50, "type-correct", "TIPOS", "⚔️"),
  { ...tier("secret-100-streak", "Memória Lendária", "Alcance uma sequência de 100 acertos.", 100, "PLATINA", "LENDARIA", 150, "streak", "SEQUENCIAS", "👑"), secret: true },
];

export const CATEGORY_LABELS: Record<AchievementCategory, string> = { GERAL: "Geral", REGIOES: "Regiões", SEQUENCIAS: "Sequências", REVISAO: "Revisão", DIFICULDADE: "Dificuldade", TIPOS: "Tipos" };
export const TIER_LABELS: Record<AchievementTier, string> = { BRONZE: "Bronze", PRATA: "Prata", OURO: "Ouro", PLATINA: "Platina" };
export const TIER_COLORS: Record<AchievementTier, string> = { BRONZE: "text-amber-700 bg-amber-100", PRATA: "text-slate-600 bg-slate-100", OURO: "text-yellow-700 bg-yellow-100", PLATINA: "text-cyan-700 bg-cyan-100" };

export function regionForPokemon(id: number): Region | null {
  return (Object.entries(REGION_RANGES) as [Region, [number, number]][]).find(([region, [min, max]]) => region !== "ALL" && id >= min && id <= max)?.[0] || null;
}
