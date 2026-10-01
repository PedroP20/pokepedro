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
  vm.runInNewContext('(function(require,module,exports,fetch){' + code + '\n})', { console, Date, Math, setTimeout, clearTimeout })(localRequire, loadedModule, loadedModule.exports, (...args) => mockFetch(...args));
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
