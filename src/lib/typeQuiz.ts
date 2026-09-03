import { fetchIdsByType } from "@/queries/pokeApi";
import { calculateDefenseMultipliers, POKEMON_TYPES } from "@/lib/typeEffectiveness";

export interface TypeQuizQuestion {
  key: string;
  defendingTypes: string[];
  effectiveTypes: string[];
}

const typeNames = Object.keys(POKEMON_TYPES);

export function getEffectiveTypes(defendingTypes: string[]) {
  const results = calculateDefenseMultipliers(defendingTypes);
  return [...results.doubleWeakness, ...results.weakness];
}

// Deriva pares exclusivamente das espécies existentes na Pokédex, sem inventar
// combinações teóricas que não existem em nenhum Pokémon.
export async function fetchTypeQuizQuestions(): Promise<TypeQuizQuestion[]> {
  const idsByType = await Promise.all(typeNames.map((type) => fetchIdsByType(type)));
  const idSets = idsByType.map((ids) => new Set(ids.filter((id) => id >= 1 && id <= 1025)));
  const questions: TypeQuizQuestion[] = typeNames.map((type) => ({
    key: type,
    defendingTypes: [type],
    effectiveTypes: getEffectiveTypes([type]),
  }));

  for (let first = 0; first < typeNames.length; first += 1) {
    for (let second = first + 1; second < typeNames.length; second += 1) {
      const hasPokemon = [...idSets[first]].some((id) => idSets[second].has(id));
      if (!hasPokemon) continue;
      const defendingTypes = [typeNames[first], typeNames[second]];
      const effectiveTypes = getEffectiveTypes(defendingTypes);
      if (effectiveTypes.length > 0) questions.push({ key: defendingTypes.join("+"), defendingTypes, effectiveTypes });
    }
  }
  return questions;
}

export function shuffleTypes<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}
