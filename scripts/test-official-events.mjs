import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
import { timingSafeEqual } from 'node:crypto';
import { loadEventImporter } from './event-importer-loader.mjs';
const { importer, events } = await loadEventImporter();
const { parsePortugueseSchedule: schedule, classifyEvent, officialUrl, officialImageUrl, parseNewsArticle, parseCalendar, parseNewsIndex, importOfficialEvents } = importer;
const now = new Date('2026-10-07T12:00:00Z');
const articleUrl = 'https://pokemongo.com/pt-BR/news/sample-event';
const catalog = [{ id: 25, name: 'Pikachu', types: ['electric'] }];
// Synthetic fixtures exercise the source structure without copying articles.
const article = (intro, extra = '', title = 'Dia Comunitário: Pikachu') => `<main><article><script type="application/ld+json">${JSON.stringify({ '@type': 'NewsArticle', headline: title, datePublished: '2026-09-30', image: 'https://lh3.googleusercontent.com/example' })}</script><h2>${title}</h2><p>${intro}</p>${extra}</article></main>`;
const mainDate = 'Sábado, 10 de outubro de 2026, das 14h às 17h, horário local';
assert.equal(schedule(mainDate, 2026).windows[0].start, '2026-10-10T14:00');
assert.equal(schedule('De 29 de setembro, às 10h, a 1º de outubro de 2026, às 20h00, horário local', 2026).windows[0].end, '2026-10-01T20:00');
assert.equal(schedule('De 4 de outubro, à 0h, a 10 de outubro de 2026, às 23h59, horário local', 2026).windows[0].end, '2026-10-11T00:00');
assert.equal(schedule('De 2 de outubro, à meia-noite, a 5 de outubro de 2026, às 20h, horário local', 2026).windows[0].start, '2026-10-02T00:00');
assert.equal(schedule('10 de outubro de 2026, das 14h30 às 17h45, horário de Brasília', 2026).windows[0].start, '2026-10-10T14:30-03:00');
assert.equal(schedule('31 de dezembro de 2026, às 10h, a 2 de janeiro de 2027, às 20h, horário local', 2026).windows[0].end, '2027-01-02T20:00');
assert.equal(schedule('31 de dezembro, às 10h, a 2 de janeiro de 2027, às 20h, horário local', 2026).windows[0].start, '2026-12-31T10:00');
assert.equal(schedule('31 de dezembro, às 10h, a 2 de janeiro, às 20h, horário local', 2026).windows[0].end, '2027-01-02T20:00');
const dateOnly = schedule('19 de fevereiro a 21 de fevereiro de 2027', 2026);
assert.equal(dateOnly.windows[0].end, '2027-02-22T00:00');
assert.equal(dateOnly.dateOnly, true);
for (const bad of ['31 de fevereiro de 2026, das 14h às 17h, horário local', '10 de outubro de 2026, das 17h às 14h, horário local', '10 de outubro de 2026, às 14h, horário local', '10 de outubro de 2026, das 14h às 17h', '10 de outubro de 2026, das 24h às 25h, horário local', 'Em breve']) assert.equal(schedule(bad, 2026), null, bad);
assert.equal(classifyEvent('Dia de Super Megarreides: teste'), 'super-mega');
assert.equal(classifyEvent('Dia de Megarreides: teste'), 'mega');
assert.equal(classifyEvent('Clássico do Dia Comunitário: teste'), 'community-classic');
assert.equal(classifyEvent('Dia de Batalhas Max: teste'), 'max-day');
assert.equal(classifyEvent('Batalhas Max: teste'), 'max');
assert.equal(classifyEvent('Segunda Max'), 'max-monday');
assert.equal(classifyEvent('Dia de chocar teste'), 'hatch');
assert.equal(classifyEvent('Festival de teste'), 'general');
assert.equal(officialUrl('/pt_BR/news/sample-event?x=1#fragment'), articleUrl);
for (const url of ['http://pokemongo.com/news/x', 'https://pokemongo.com.evil.test/news/x', 'https://user:pass@pokemongo.com/news/x', 'https://pokemongo.com:8443/news/x', 'https://127.0.0.1/news/x']) assert.equal(officialUrl(url), null);
assert.equal(officialImageUrl('https://evil.test/track.png'), null);
assert.equal(officialImageUrl('https://lh3.googleusercontent.com/example'), 'https://lh3.googleusercontent.com/example');
const index = `<main><a href="/pt_BR/news/sample-event">Evento</a><a href="/pt-BR/news/sample-event">Duplicado</a><a href="https://evil.test/news/attack">Inválido</a></main>`;
assert.deepEqual(parseNewsIndex(index), [articleUrl]);
assert.throws(() => parseNewsIndex('<main>Indisponível</main>'));
const event = parseNewsArticle(article(mainDate, '<h2>Bônus</h2><ul><li>2× PE por captura<ul><li>Um detalhe adicional</li></ul></li><li>Mais encontros com Pikachu</li></ul><h2>Pesquisa</h2><p>12 de outubro de 2026, das 10h às 20h, horário local</p><img src="https://evil.test/track.png"><script>alert(1)</script>'), articleUrl, catalog, now.toISOString());
assert.equal(event.schedule.windows[0].end, '2026-10-10T17:00');
assert.equal(event.announced, '2026-09-30');
assert.equal(event.categoryId, 'community');
assert.equal(event.featured[0].id, 25);
assert.equal(event.images.length, 1);
assert.equal(event.sections.find(s => s.title === 'Bônus').items.includes('Um detalhe adicional'), true);
assert.equal(event.sections.find(s => s.title === 'Bônus').items.includes('2× PE por captura'), true);
assert.equal(JSON.stringify(event).includes('alert(1)'), false);
assert.equal(event.source.url, articleUrl);
assert.equal(parseNewsArticle(article('Mais novidades em breve'), articleUrl, catalog, now.toISOString()), null);
const repeated = parseNewsArticle(article(mainDate + '</p><p>17 de outubro de 2026, das 14h às 17h, horário local'), articleUrl, catalog, now.toISOString());
assert.equal(repeated.schedule.windows.length, 2);
const minior = parseNewsArticle(article('', '<h2>Estreia</h2><p>19 de outubro de 2026, das 14h às 17h, horário local</p>', 'Chuvas de Pikachu'), articleUrl, catalog, now.toISOString());
assert.equal(minior.name, 'Chuvas de Pikachu');
assert.equal(parseCalendar('<main>Faça login com sua conta Pokémon GO para ver Eventos</main>', importer.officialCalendarUrl(now), now.toISOString()).requiresLogin, true);
assert.equal(parseCalendar(`<script type="application/ld+json">${JSON.stringify({ '@type': 'Event', name: 'Invalid', startDate: '2026-02-31T14:00Z', endDate: '2026-03-04T17:00Z' })}</script>`, importer.officialCalendarUrl(now), now.toISOString()).events.length, 0);
const calendar = parseCalendar(`<script type="application/ld+json">${JSON.stringify({ '@type': 'Event', name: 'Dia de Megarreides', startDate: '2026-10-10T14:00:00.000Z', endDate: '2026-10-10T17:00:00.000Z', url: articleUrl })}</script>`, importer.officialCalendarUrl(now), now.toISOString());
assert.equal(calendar.events.length, 1);
assert.equal(events.eventWindows(calendar.events[0]).length, 1);
assert.equal(importer.officialCalendarUrl(new Date('2027-01-01T01:00Z')), 'https://pokemongo.com/pt-BR/events/january-2027');
const fetchPage = async url => url.includes('/events/') ? '<main>Faça login com sua conta Pokémon GO para ver Eventos</main>' : url === importer.OFFICIAL_NEWS_URL ? index : article(mainDate);
const feed = await importOfficialEvents(fetchPage, catalog, now);
assert.equal(feed.events.length, 1);
assert.equal(feed.coverage, 'public-announcements');
assert.equal(feed.diagnostics.calendarRequiresLogin, true);
await assert.rejects(importOfficialEvents(async url => { if (url === articleUrl) throw new Error('Network unavailable'); return fetchPage(url); }, catalog, now));
await assert.rejects(importOfficialEvents(async url => url === articleUrl ? article('Sem data') : fetchPage(url), catalog, now));
// Local retention follows the trainer's timezone, including DST changes.
for (const zone of ['America/Sao_Paulo', 'Asia/Tokyo', 'America/New_York']) {
  process.env.TZ = zone;
  const expiry = events.eventExpiresAt(event);
  assert.equal(expiry, events.eventWindows(event)[0].end + 7 * 24 * 60 * 60_000);
  assert.equal(events.retainedEvents([event], expiry - 1).length, 1);
  assert.equal(events.retainedEvents([event], expiry).length, 0);
}
const serverExpiry = Date.parse('2026-10-10T17:00Z') + 12 * 60 * 60_000 + 7 * 24 * 60 * 60_000;
assert.equal(events.retainedServerEvents([event], serverExpiry - 1).length, 1);
assert.equal(events.retainedServerEvents([event], serverExpiry).length, 0);
const absoluteExpiry = events.eventExpiresAt(calendar.events[0]);
assert.equal(events.retainedServerEvents(calendar.events, absoluteExpiry).length, 0);
assert.equal(events.mergeEvents([event], [{ ...event, name: 'Updated' }]).length, 1);
assert.equal(events.mergeEvents([event], [{ ...event, name: 'Updated' }])[0].name, 'Updated');
// The scheduled endpoint authenticates before performing any network work.
let called = 0;
const cronModule = { exports: {} };
const cronCode = ts.transpileModule(fs.readFileSync('src/app/api/events/sync/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
const environment = {};
vm.runInNewContext('(function(require,module,exports){' + cronCode + '\n})', { process: { env: environment }, Buffer, Response })(specifier => specifier === 'node:crypto' ? { timingSafeEqual } : { getEventFeed: async () => { called++; return feed; } }, cronModule, cronModule.exports);
assert.equal((await cronModule.exports.GET(new Request('https://example.test/api/events/sync'))).status, 401);
environment.CRON_SECRET = 'test-secret';
assert.equal((await cronModule.exports.GET(new Request('https://example.test/api/events/sync', { headers: { authorization: 'Bearer incorrect' } }))).status, 401);
assert.equal(called, 0);
assert.equal((await cronModule.exports.GET(new Request('https://example.test/api/events/sync', { headers: { authorization: 'Bearer test-secret' } }))).status, 200);
assert.equal(called, 1);
console.log('Official event ingestion, categories, dates, sanitization, cron authorization and 7-day retention passed.');

// Exercise the production feed wrapper and its fetch boundaries without network.
const { createRequire } = await import('node:module');
const path = await import('node:path');
const packageRequire = createRequire(import.meta.url);
const cachedFeed = feed;
let unavailable = false;
let transport = async () => new Response('<main>Fixture</main>', { headers: { 'content-type': 'text/html' } });
const synchronizationErrors = [];
class FeedClock extends Date { constructor(...args) { if (args.length) super(...args); else super(now.getTime()); } static now() { return now.getTime(); } }
const moduleCache = new Map();
function loadServer(file) {
  file = path.resolve(file);
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (moduleCache.has(file)) return moduleCache.get(file).exports;
  const loaded = { exports: {} };
  moduleCache.set(file, loaded);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const requireLocal = specifier => {
    if (specifier === 'next/cache') return { unstable_cache: () => async () => { if (unavailable) throw new Error('Source unavailable'); return cachedFeed; } };
    if (specifier.startsWith('.')) return loadServer(path.resolve(path.dirname(file), specifier.endsWith('.json') ? specifier : `${specifier}.ts`));
    return packageRequire(specifier);
  };
  vm.runInNewContext('(function(require,module,exports){' + code + '\n})', { console: { error: (...args) => synchronizationErrors.push(args.join(' ')) }, URL, Date: FeedClock, Error, AbortSignal, fetch: (...args) => transport(...args) })(requireLocal, loaded, loaded.exports);
  return loaded.exports;
}
const server = loadServer('src/lib/server/eventFeed.ts');
const normalFeed = await server.getEventFeed();
assert.equal(normalFeed.health, 'ok');
assert.equal(normalFeed.events.some(e => e.id === event.id), true);
unavailable = true;
const fallback = await server.getEventFeed();
assert.equal(fallback.health, 'fallback');
assert.equal(synchronizationErrors.length, 1);
assert.equal(fallback.events.some(e => e.source?.kind === 'news'), true);
assert.equal(fallback.events.some(e => e.id === 'max-ralts-2026-09'), false);
let networkCalls = 0;
transport = async (_url, options) => { networkCalls++; assert.equal(options.headers.Cookie, undefined); return new Response(null, { status: 302, headers: { location: 'https://evil.test/steal' } }); };
await assert.rejects(server.fetchOfficialPage(articleUrl), /Redirecionamento/);
assert.equal(networkCalls, 1);
transport = async () => new Response('<main>OK</main>', { headers: { 'content-type': 'text/html' } });
assert.equal(await server.fetchOfficialPage(articleUrl), '<main>OK</main>');
transport = async () => new Response('{}', { headers: { 'content-type': 'application/json' } });
await assert.rejects(server.fetchOfficialPage(articleUrl), /HTML/);
transport = async () => new Response('x'.repeat(2_000_001), { headers: { 'content-type': 'text/html' } });
await assert.rejects(server.fetchOfficialPage(articleUrl), /limite/);
transport = async () => new Response('Offline', { status: 503, headers: { 'content-type': 'text/html' } });
await assert.rejects(server.fetchOfficialPage(articleUrl), /503/);
console.log('Production feed fallback, expired-event pruning and source fetch boundaries passed.');





