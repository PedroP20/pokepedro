interface PokemonModelForm {
  formName: string;
  model: string;
}

interface PokemonModel {
  id: number;
  forms: PokemonModelForm[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseModelCatalog(data: unknown): PokemonModel[] {
  const catalog = Array.isArray(data) ? data : isRecord(data) ? data.pokemon : undefined;
  if (!Array.isArray(catalog)) throw new Error("O catálogo 3D retornou dados inválidos.");
  return catalog.flatMap((pokemon: unknown) => {
    if (!isRecord(pokemon) || !Number.isInteger(pokemon.id) || Number(pokemon.id) < 1 || !Array.isArray(pokemon.forms)) return [];
    const forms = pokemon.forms.filter((form: unknown): form is PokemonModelForm => {
      if (!isRecord(form) || typeof form.formName !== "string" || !form.formName.trim() || typeof form.model !== "string") return false;
      try { return new URL(form.model).protocol === "https:"; } catch { return false; }
    });
    return [{ id: Number(pokemon.id), forms }];
  });
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export function getExactModel(pokemon: PokemonModel | undefined, baseName: string, formSlug: string, isShiny: boolean) {
  if (!pokemon) return undefined;
  const selected = normalize(formSlug).replace(normalize(baseName), "") || "regular";
  const wanted = isShiny ? (selected === "regular" ? "shiny" : `shiny${selected}`) : selected;
  return pokemon.forms.find((form) => normalize(form.formName) === wanted);
}
