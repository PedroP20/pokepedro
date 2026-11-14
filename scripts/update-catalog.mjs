// Rebuild from the official PokeAPI dataset. No network calls at build time.
import { mkdir, writeFile } from 'node:fs/promises';
const base = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/';
async function readCsv(name) {
  const response = await fetch(`${base}${name}.csv`);
  if (!response.ok) throw new Error(`Dataset ${name}: ${response.status}`);
  const [header, ...lines] = (await response.text()).trim().split(/\r?\n/);
  const keys = header.split(',');
  return lines.map(line => Object.fromEntries(line.split(',').map((value, i) => [keys[i], value])));
}
const [pokemon, species, types] = await Promise.all(['pokemon', 'pokemon_species', 'pokemon_types'].map(readCsv));
const labels = { 1: 'Normal', 2: 'Lutador', 3: 'Voador', 4: 'Venenoso', 5: 'Terrestre', 6: 'Pedra', 7: 'Inseto', 8: 'Fantasma', 9: 'Aço', 10: 'Fogo', 11: 'Água', 12: 'Planta', 13: 'Elétrico', 14: 'Psíquico', 15: 'Gelo', 16: 'Dragão', 17: 'Sombrio', 18: 'Fada' };
const canEvolve = new Set(species.map(row => Number(row.evolves_from_species_id)).filter(Boolean));
const pokemonTypes = new Map();
for (const row of types) {
  const id = Number(row.pokemon_id);
  const list = pokemonTypes.get(id) || [];
  list[Number(row.slot) - 1] = labels[row.type_id];
  pokemonTypes.set(id, list);
}
const defaults = new Map(pokemon.filter(row => row.is_default === '1').map(row => [Number(row.species_id), row]));
const catalog = species.filter(row => Number(row.id) <= 1025).map(row => {
  const data = defaults.get(Number(row.id));
  if (!data) throw new Error(`Missing default Pokémon ${row.id}`);
  return { id: Number(row.id), name: row.identifier.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), types: pokemonTypes.get(Number(data.id)), height: Number(data.height) / 10, weight: Number(data.weight) / 10, canEvolve: canEvolve.has(Number(row.id)) };
});
if (catalog.length !== 1025 || catalog.some(p => !p.types?.length)) throw new Error('Incomplete catalog');
await mkdir('public/data', { recursive: true });
await writeFile('public/data/pokemon.json', JSON.stringify(catalog) + '\n');
await mkdir('public/images', { recursive: true });
for (const [name, id] of [['pikachu', 25], ['eevee', 133]]) {
  const response = await fetch(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`);
  if (!response.ok) throw new Error(`Artwork ${id}: ${response.status}`);
  await writeFile(`public/images/${name}.png`, Buffer.from(await response.arrayBuffer()));
}
console.log(`Saved ${catalog.length} Pokémon and local home artwork.`);
