import fs from 'node:fs';
import ts from 'typescript';
export const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString('base64')}`;
export async function loadEventImporter() {
  const eventsUrl = moduleUrl(fs.readFileSync('src/lib/events.ts', 'utf8'));
  const importerUrl = moduleUrl(fs.readFileSync('src/lib/server/officialEvents.ts', 'utf8').replace("'../events'", JSON.stringify(eventsUrl)).replace("'cheerio'", JSON.stringify(import.meta.resolve('cheerio'))));
  return { events: await import(eventsUrl), importer: await import(importerUrl) };
}
