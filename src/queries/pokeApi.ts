import { PokemonDetails, PokemonOption, EvolutionNode, PokemonVariety } from "@/types/pokemon";

const BASE_URL = "https://pokeapi.co/api/v2";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// 🌟 HELPER: Transforma nomes com hífen em Title Case (Ex: "charizard-mega-x" -> "Charizard Mega X")
const toTitleCase = (str: string) => {
  return str
    .split("-")
    .map((word) => capitalize(word))
    .join(" ");
};

const REGION_MAP: Record<string, string> = {
  "generation-i": "Kanto", "generation-ii": "Johto", "generation-iii": "Hoenn",
  "generation-iv": "Sinnoh", "generation-v": "Unova", "generation-vi": "Kalos",
  "generation-vii": "Alola", "generation-viii": "Galar", "generation-ix": "Paldea",
};

const GEN_MAP_PT: Record<string, string> = {
  "generation-i": "1ª Geração", "generation-ii": "2ª Geração", "generation-iii": "3ª Geração",
  "generation-iv": "4ª Geração", "generation-v": "5ª Geração", "generation-vi": "6ª Geração",
  "generation-vii": "7ª Geração", "generation-viii": "8ª Geração", "generation-ix": "9ª Geração",
};

const TYPE_MAP_PT: Record<string, string> = {
  normal: "Normal", fire: "Fogo", water: "Água", grass: "Planta",
  electric: "Elétrico", ice: "Gelo", fighting: "Lutador", poison: "Venenoso",
  ground: "Terrestre", flying: "Voador", psychic: "Psíquico", bug: "Inseto",
  rock: "Pedra", ghost: "Fantasma", dragon: "Dragão", steel: "Aço", fairy: "Fada",
};

const TYPE_MAP_EN: Record<string, string> = Object.entries(TYPE_MAP_PT).reduce(
  (acc, [en, pt]) => ({ ...acc, [pt]: en }), {}
);

interface PokeAPIFlavorEntry { flavor_text: string; language: { name: string } }
interface PokeAPITypeEntry { type: { name: string } }
interface PokeAPIEvolutionNode { species: { name: string; url: string }; evolves_to: PokeAPIEvolutionNode[] }
interface PokeAPIVariety { is_default: boolean; pokemon: { name: string; url: string } }

const getIdFromUrl = (url: string): number => {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
};

export async function fetchPokemonMasterList(): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${BASE_URL}/pokemon?limit=1025`);
  if (!res.ok) throw new Error("Erro ao carregar lista mestre da Pokédex");
  const data = await res.json();
  return data.results.map((item: { name: string; url: string }) => ({
    id: getIdFromUrl(item.url),
    name: capitalize(item.name),
  }));
}

export async function fetchIdsByType(typeNamePt: string): Promise<number[]> {
  const enType = TYPE_MAP_EN[typeNamePt];
  if (!enType) return [];
  const res = await fetch(`${BASE_URL}/type/${enType}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.pokemon.map((p: { pokemon: { url: string } }) => getIdFromUrl(p.pokemon.url));
}

const parseEvolutionChain = (chainNode: PokeAPIEvolutionNode): EvolutionNode[] => {
  const evolutions: EvolutionNode[] = [];
  const traverse = (node: PokeAPIEvolutionNode) => {
    if (!node || !node.species) return;
    const id = getIdFromUrl(node.species.url);
    evolutions.push({
      id,
      name: capitalize(node.species.name),
      spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    });
    if (node.evolves_to && node.evolves_to.length > 0) {
      node.evolves_to.forEach((next) => traverse(next));
    }
  };
  traverse(chainNode);
  return evolutions;
};

export async function fetchPokemonOption(id: number): Promise<PokemonOption> {
  const res = await fetch(`${BASE_URL}/pokemon/${id}`);
  if (!res.ok) throw new Error(`Erro ao buscar Pokémon ${id}`);
  const data = await res.json();
  return { id: data.id, name: capitalize(data.name) };
}

export async function fetchPokemonDetails(id: number): Promise<PokemonDetails> {
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${BASE_URL}/pokemon/${id}`),
    fetch(`${BASE_URL}/pokemon-species/${id}`),
  ]);

  if (!pokemonRes.ok || !speciesRes.ok) throw new Error(`Erro ao buscar detalhes do Pokémon ${id}`);

  const pokemonData = await pokemonRes.json();
  const speciesData = await speciesRes.json();

  let evolutions: EvolutionNode[] = [];
  if (speciesData.evolution_chain?.url) {
    const evoRes = await fetch(speciesData.evolution_chain.url);
    if (evoRes.ok) {
      const evoData = await evoRes.json();
      evolutions = parseEvolutionChain(evoData.chain);
    }
  }

  // 🧬 MAPEAMENTO DE VARIANTES EM TITLE CASE (Suporta Mega X e Y, Múltiplas Formas Regionais, etc.)
  const varieties: PokemonVariety[] = (speciesData.varieties || []).map((v: PokeAPIVariety) => {
    const varId = getIdFromUrl(v.pokemon.url);
    const varName = v.pokemon.name.toLowerCase();
    let formType: PokemonVariety["formType"] = "NORMAL";

    if (varName.includes("-mega")) formType = "MEGA";
    else if (varName.includes("-gmax")) formType = "GIGANTAMAX";
    else if (varName.includes("-dmax") || (varId >= 810 && varId <= 898 && !v.is_default)) formType = "DYNAMAX";
    else if (varName.includes("-alola") || varName.includes("-galar") || varName.includes("-hisui") || varName.includes("-paldea")) formType = "REGIONAL";
    else if (!v.is_default) formType = "ALTERNATIVE";

    return { name: toTitleCase(v.pokemon.name), id: varId, formType };
  });

  const flavorEntry =
    speciesData.flavor_text_entries.find((e: PokeAPIFlavorEntry) => e.language.name === "pt" || e.language.name === "pt-BR") ||
    speciesData.flavor_text_entries.find((e: PokeAPIFlavorEntry) => e.language.name === "en");

  const genName = speciesData.generation.name.toLowerCase();
  const regionName = REGION_MAP[genName] || "Desconhecida";
  const generationPt = GEN_MAP_PT[genName] || capitalize(genName.replace("-", " "));

  return {
    id: pokemonData.id,
    name: capitalize(pokemonData.name),
    spriteUrl: pokemonData.sprites.front_default || "",
    artworkUrl: pokemonData.sprites.other["official-artwork"].front_default || pokemonData.sprites.front_default,
    types: pokemonData.types.map((t: PokeAPITypeEntry) => TYPE_MAP_PT[t.type.name.toLowerCase()] || capitalize(t.type.name)),
    height: pokemonData.height / 10,
    weight: pokemonData.weight / 10,
    generation: generationPt,
    region: regionName,
    isLegendary: speciesData.is_legendary,
    isMythic: speciesData.is_mythic,
    flavorText: flavorEntry ? flavorEntry.flavor_text.replace(/[\n\f\r]/g, " ") : "Sem descrição na Pokédex.",
    evolutions,
    varieties,
    hasGenderDifferences: speciesData.has_gender_differences || false,
  };
}