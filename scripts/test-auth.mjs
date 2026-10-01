// Exercises the actual stores with an in-memory Firebase transport; no production writes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const requirePackage = createRequire(import.meta.url);
const cloud = new Map();
const storage = new Map();
const cache = new Map();
let onAuthChange;
let holdRead = false;
let releaseRead;
const firestore = {
  doc: (_db, ...parts) => parts.join('/'),
  collection: (_db, ...parts) => parts.join('/'),
  setDoc: async (ref, value) => { cloud.set(ref, structuredClone(value)); },
  getDoc: async ref => {
    const data = structuredClone(cloud.get(ref));
    if (holdRead) await new Promise(resolve => { releaseRead = resolve; });
    return { exists: () => !!data, data: () => data };
  },
  getDocs: async ref => {
    const values = [...cloud].filter(([key]) => key.startsWith(`${ref}/`)).map(([, value]) => structuredClone(value));
    if (holdRead) await new Promise(resolve => { releaseRead = resolve; });
    return { forEach: callback => values.forEach(value => callback({ data: () => value })) };
  },
};
function load(file) {
  file = path.resolve(file);
  if (file.endsWith(path.join('lib', 'firebase.ts'))) return { db: {}, auth: {} };
  if (cache.has(file)) return cache.get(file).exports;
  const loadedModule = { exports: {} };
  cache.set(file, loadedModule);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const localRequire = specifier => {
    if (specifier === 'firebase/firestore') return firestore;
    if (specifier === 'firebase/auth') return { onAuthStateChanged: (_auth, callback) => { onAuthChange = callback; return () => {}; }, signOut: async () => { await onAuthChange(null); } };
    return specifier.startsWith('@/') ? load(`src/${specifier.slice(2)}.ts`) : specifier.startsWith('.') ? load(path.resolve(path.dirname(file), `${specifier}.ts`)) : requirePackage(specifier);
  };
  const localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  vm.runInNewContext('(function(require,module,exports){' + code + '\n})', { console, Date, localStorage })(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const { useAuthStore: auth } = load('src/store/useAuthStore.ts');
const { useLearningStore: learning } = load('src/store/useLearningStore.ts');
const { useAchievementStore: achievements } = load('src/store/useAchievementStore.ts');
auth.getState().initAuthListener();
await onAuthChange({ uid: 'trainer-a' });
assert.equal(auth.getState().isLoading, false);
await learning.getState().recordAnswer(25, true, 1200);
assert.equal(cloud.get('users/trainer-a/mastery/25').timesCorrect, 1);
await auth.getState().logout();
assert.equal(Object.keys(learning.getState().stats).length, 0);
await onAuthChange({ uid: 'trainer-a' });
assert.equal(learning.getState().stats[25].timesCorrect, 1, 'login restores saved progress');

holdRead = true;
const pendingLogin = onAuthChange({ uid: 'trainer-a' });
assert.equal(auth.getState().isLoading, true, 'home waits for initial cloud synchronization');
await auth.getState().logout();
holdRead = false;
releaseRead();
await pendingLogin;
assert.equal(auth.getState().user, null);
assert.equal(Object.keys(learning.getState().stats).length, 0, 'late reads must not restore the logged-out user');
await onAuthChange({ uid: 'trainer-b' });
assert.equal(Object.keys(learning.getState().stats).length, 0, 'another account must not inherit mastery');
assert.equal(achievements.getState().progress.correct, 0);

holdRead = true;
const pendingAchievements = achievements.getState().syncFromFirebase('trainer-a');
achievements.getState().clearLocalProgress();
holdRead = false;
releaseRead();
await pendingAchievements;
assert.equal(achievements.getState().isSynced, false, 'late achievement reads must not activate saving for an old account');
const { googleLoginError } = load('src/lib/authErrors.ts');
assert.match(googleLoginError({ code: 'auth/popup-blocked' }), /pop-ups/);
assert.match(googleLoginError({ code: 'auth/unauthorized-domain' }), /domínio/);
console.log('Auth store save/restore, logout races, account isolation and error handling passed (mock Firebase).');
