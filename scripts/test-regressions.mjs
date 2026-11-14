import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const requirePackage = createRequire(import.meta.url);
let saved;
const mocks = {
  useSavedGameStore: { getState: () => ({ saveGame: value => { saved = structuredClone(value); }, clearSavedGame: () => { saved = null; } }) },
  useLearningStore: { getState: () => ({ recordAnswer() {} }) },
  useAchievementStore: { getState: () => ({ recordPokemonAnswer() {}, recordTypeAnswer() {} }) },
};
const cache = new Map();
let mockFetch = () => { throw new Error('Unexpected network request'); };
function load(file) {
  file = path.resolve(file);
  const name = path.basename(file, '.ts');
  if (mocks[name]) return { [name]: mocks[name] };
  if (cache.has(file)) return cache.get(file).exports;
  const loadedModule = { exports: {} };
  cache.set(file, loadedModule);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const localRequire = specifier => specifier.startsWith('@/') ? load(`src/${specifier.slice(2)}.ts`) : specifier.startsWith('.') ? load(path.resolve(path.dirname(file), `${specifier}.ts`)) : requirePackage(specifier);
  vm.runInNewContext('(function(require,module,exports,fetch){' + code + '\n})', { console, Date, Math, URL, AbortSignal, setTimeout, clearTimeout })(localRequire, loadedModule, loadedModule.exports, (...args) => mockFetch(...args));
  return loadedModule.exports;
}
const { useGameStore: game } = load('src/store/useGameStore.ts');
const state = () => game.getState();
state().startGame('ALL', 'ASC', 'IMAGE', 'NORMAL', 'OPTIONS', true, false, 'FFA', 1, [1, 4, 25]);
state().answerQuestion(1);
const options = JSON.stringify(state().currentOptionIds);
state().resumeGame(saved);
assert.equal(state().currentCorrectId, 1);
assert.equal(JSON.stringify(state().remainingIds), '[4,25]');
assert.equal(JSON.stringify(state().currentOptionIds), options);
assert.equal(state().score, 1);
state().answerQuestion(1);
assert.equal(state().score, 1, 'resuming an answered question must not score twice');
state().nextQuestion();
assert.equal(state().currentCorrectId, 4, 'resume must not skip a Pokémon');
state().resumeGame({ ...saved, learningPhase: 3 });
assert.equal(state().learningPhase, 3);
state().startGame('ALL', 'ASC', 'IMAGE', 'NORMAL', 'OPTIONS', true, false, 'FFA', 1, [25]);
state().resumeGame(saved);
assert.equal(state().remainingIds.length, 0);
assert.equal(state().totalInRegion, 1);
state().answerQuestion(25);
state().nextQuestion();
assert.equal(state().status, 'FINISHED');
const questions = [{ key: 'Fogo', defendingTypes: ['Fogo'], effectiveTypes: ['Água'] }, { key: 'Água', defendingTypes: ['Água'], effectiveTypes: ['Planta'] }];
state().startTypeQuiz('TYPE_STANDARD', questions, true, true);
state().completeTypeQuestion(true);
state().resumeGame(saved);
state().completeTypeQuestion(true);
assert.equal(state().score, 1);
assert.equal(state().totalInRegion, 2);
assert.equal(state().typeQuestionAnswered, true);
state().nextTypeQuestion();
assert.equal(state().currentTypeQuestion.key, 'Água');
assert.equal(state().typeQuestionAnswered, false);
state().startGame('ALL', 'ASC', 'IMAGE', 'NORMAL', 'OPTIONS', false, false, 'FFA', 1, [1]);
assert.equal(state().currentTypeQuestion, null);
state().startTypeQuiz('TYPE_HARD', [], false);
assert.equal(state().status, 'FINISHED');

const api = load('src/queries/pokeApi.ts');
const calls = [];
mockFetch = async url => {
  calls.push(url);
  return { ok: true, json: async () => url.includes('/pokemon-species/') ? { id: 130, generation: { name: 'generation-i' }, flavor_text_entries: [], varieties: [] } : { id: 10041, name: 'gyarados-mega', species: { url: 'https://pokeapi.co/api/v2/pokemon-species/130/' }, sprites: { front_default: '', other: { 'official-artwork': {} } }, types: [], height: 65, weight: 3050 } };
};
const mega = await api.fetchPokemonDetails(10041);
assert.equal(mega.id, 10041);
assert.equal(mega.speciesId, 130);
assert.equal(calls[1], 'https://pokeapi.co/api/v2/pokemon-species/130/');
mockFetch = async () => ({ ok: false });
await assert.rejects(api.fetchPokemonDetails(25));
await assert.rejects(api.fetchIdsByType('Fogo'));
console.log('Game resume, scoring, type quiz and PokéAPI regression tests passed.');

const catalog = JSON.parse(fs.readFileSync('public/data/pokemon.json', 'utf8'));
assert.equal(catalog.length, 1025);
assert.equal(new Set(catalog.map(p => p.id)).size, 1025);
const { POKEMON_TYPES, calculateDefenseMultipliers } = load('src/lib/typeEffectiveness.ts');
assert.ok(catalog.every(p => p.types.length > 0 && p.types.every(type => POKEMON_TYPES[type])), 'every catalog type has a renderable badge');
const { filterCatalog } = load('src/lib/catalogFilters.ts');
const filters = { searchTerm: '', region: 'ALL', selectedTypes: [], sortBy: 'ID', evolutionStatus: 'ALL' };
assert.equal(filterCatalog(catalog, { ...filters, region: 'KANTO' }).length, 151);
assert.equal(filterCatalog(catalog, { ...filters, searchTerm: '#0197' })[0].name, 'Umbreon');
assert.ok(filterCatalog(catalog, { ...filters, selectedTypes: ['Sombrio'] }).some(p => p.id === 197));
assert.ok(filterCatalog(catalog, { ...filters, selectedTypes: ['Planta', 'Venenoso'] }).every(p => p.types.includes('Planta') && p.types.includes('Venenoso')));
assert.ok(filterCatalog(catalog, { ...filters, evolutionStatus: 'HAS_EVOLUTION' }).some(p => p.id === 1));
assert.ok(!filterCatalog(catalog, { ...filters, evolutionStatus: 'HAS_EVOLUTION' }).some(p => p.id === 3));
for (const key of ['HEIGHT_ASC', 'HEIGHT_DESC', 'WEIGHT_ASC', 'WEIGHT_DESC']) {
  const sorted = filterCatalog(catalog, { ...filters, sortBy: key });
  const field = key.startsWith('HEIGHT') ? 'height' : 'weight';
  assert.ok(sorted.every((p, i) => i === 0 || (key.endsWith('ASC') ? p[field] >= sorted[i-1][field] : p[field] <= sorted[i-1][field])));
}
const defense = calculateDefenseMultipliers(catalog.find(p => p.id === 197).types);
assert.equal(JSON.stringify(defense.weakness), JSON.stringify(['Lutador', 'Inseto', 'Fada']));
assert.equal(JSON.stringify(defense.immune), JSON.stringify(['Psíquico']));
mockFetch = async url => ({ ok: true, json: async () => url.includes('pokemon-species') ? { id:197, generation:{ name:'generation-ii' }, flavor_text_entries:[], varieties:[] } : { id:197, name:'umbreon', species:{url:'https://pokeapi.co/api/v2/pokemon-species/197/'}, sprites:{front_default:null}, types:[{type:{name:'dark'}}], height:10, weight:270 } });
const umbreon = await api.fetchPokemonDetails(197);
assert.equal(umbreon.types[0], 'Sombrio', 'dark must be translated before rendering');
assert.equal(umbreon.artworkUrl, '', 'missing artwork metadata does not crash details');
mockFetch = async () => ({ ok:true, json:async () => catalog });
const actualQuestions = await load('src/lib/typeQuiz.ts').fetchTypeQuizQuestions();
assert.ok(actualQuestions.some(q => q.key === 'Sombrio'));
assert.ok(actualQuestions.filter(q => q.defendingTypes.length === 2).every(q => catalog.some(p => q.defendingTypes.every(t => p.types.includes(t)))), 'guide combinations exist in actual species');
console.log('Catalog, all sort modes, combined filters, dark-type rendering and actual type combinations: passed.');

const { parseModelCatalog, getExactModel } = load('src/lib/pokemonModels.ts');
const models = parseModelCatalog({ pokemon: [
  null, { id: 1, forms: null }, { id: -1, forms: [] },
  { id: 6, forms: [null, { formName: 42, model: 'https://models.example/x.glb' }, { formName: 'regular', model: 'javascript:alert(1)' },
    { formName: 'regular', model: 'https://models.example/charizard.glb' }, { formName: 'shiny-mega-x', model: 'https://models.example/shiny.glb' }] },
] });
assert.equal(models.length, 1, 'malformed model records cannot crash the Pokédex');
assert.equal(models[0].forms.length, 2);
assert.equal(getExactModel(models[0], 'Charizard', 'charizard', false).model, 'https://models.example/charizard.glb');
assert.equal(getExactModel(models[0], 'Charizard', 'charizard-mega-x', true).model, 'https://models.example/shiny.glb');
assert.equal(getExactModel(undefined, 'Charizard', 'charizard', false), undefined);
assert.throws(() => parseModelCatalog(null));
assert.throws(() => parseModelCatalog({ pokemon: 'unavailable' }));

const React = requirePackage('react');
const { renderToStaticMarkup } = requirePackage('react-dom/server');
function loadComponent(file) {
  const componentModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const componentRequire = specifier => specifier.startsWith('.')
    ? loadComponent(path.resolve(path.dirname(file), `${specifier}.tsx`))
    : requirePackage(specifier);
  vm.runInNewContext('(function(require,module,exports){' + code + '\n})', { console, setTimeout, clearTimeout })(componentRequire, componentModule, componentModule.exports);
  return componentModule.exports;
}
const audioModule = { exports: loadComponent('src/components/game/AudioChallengeDisplay.tsx') };
for (const id of [25, 1]) {
  const html = renderToStaticMarkup(React.createElement(audioModule.exports.default, { id, name: 'Pokémon', isRevealed: false }));
  assert.ok(html.includes(`/latest/${id}.ogg`), 'each question owns an audio element for its current Pokémon');
  assert.ok(html.includes('aria-label="Ouvir som do Pokémon"'), 'sound can be played with keyboard and assistive technology');
}
console.log('Malformed 3D catalog, model forms and audio source regression tests passed.');
