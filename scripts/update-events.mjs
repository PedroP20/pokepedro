import fs from 'node:fs';
import { loadEventImporter } from './event-importer-loader.mjs';
const { importer, events } = await loadEventImporter();
const catalog = JSON.parse(fs.readFileSync('public/data/pokemon.json', 'utf8'));
const signal = AbortSignal.timeout(45_000);
async function fetchPage(input) {
  let url = importer.officialUrl(input);
  if (!url) throw new Error('Invalid source');
  for (let redirects = 0; redirects < 4; redirects++) {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]), headers: { Accept: 'text/html', 'Accept-Language': 'pt-BR', 'User-Agent': 'PokeClub/2.0 (public event importer)' } });
    if ([301,302,303,307,308].includes(response.status)) {
      url = importer.officialUrl(response.headers.get('location') || '', url);
      if (!url) throw new Error('Invalid redirect');
      continue;
    }
    if (!response.ok) throw new importer.OfficialSourceError(response.status, url);
    if (!response.headers.get('content-type')?.includes('text/html')) throw new Error('The source did not return HTML.');
    const html = await response.text();
    if (html.length > 2_000_000) throw new Error('Response too large');
    return html;
  }
  throw new Error('Too many redirects');
}
const calendar = fs.existsSync('src/data/calendar-events.json') ? JSON.parse(fs.readFileSync('src/data/calendar-events.json', 'utf8')) : undefined;
let feed;
try { feed = await importer.importOfficialEvents(fetchPage, catalog, new Date(), calendar); }
catch (error) { console.error(error instanceof Error ? error.message : 'Event update failed.'); process.exit(1); }
// The bootstrap is metadata only. Complete details are read from the official
// public source by the server, with attribution, rather than copied into Git.
feed.events = events.retainedServerEvents(feed.events, Date.now()).map(event => { const metadata = { ...event }; delete metadata.sections; if (metadata.schedule) { metadata.schedule = { ...metadata.schedule }; delete metadata.schedule.label; } return metadata; });
fs.writeFileSync('src/data/official-events.json', `${JSON.stringify(feed, null, 2)}\n`);
console.log(JSON.stringify({ updatedAt: feed.updatedAt, count: feed.events.length, diagnostics: feed.diagnostics }, null, 2));



