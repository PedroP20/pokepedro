import fs from 'node:fs';
import { loadEventImporter } from './event-importer-loader.mjs';

// Input contains the selected public event records from the authenticated
// calendar, never an entire page, cookies, player location or account state.
const input = process.argv[2];
if (!input) throw new Error('Informe o arquivo com os meses e eventos do calendário.');
const raw = JSON.parse(fs.readFileSync(input, 'utf8'));
if (!Array.isArray(raw.months) || !Number.isFinite(Date.parse(raw.capturedAt))) throw new Error('Exportação do calendário inválida.');
const { importer, events } = await loadEventImporter();
const catalog = JSON.parse(fs.readFileSync('public/data/pokemon.json', 'utf8'));
const collected = [], months = [];
for (const month of raw.months) {
  if (!/^[a-z]+-\d{4}$/.test(month.month) || !Array.isArray(month.events)) throw new Error('Mês inválido.');
  const url = `https://pokemongo.com/pt-BR/events/${month.month}`;
  const parsed = importer.parseCalendarRecords(month.events, url, raw.capturedAt, catalog);
  if (parsed.length !== month.events.length) throw new Error(`Há registros inválidos em ${month.month}; a importação anterior foi preservada.`);
  collected.push(...parsed);
  if (parsed.length) months.push(month.month);
}
const snapshot = { checkedAt: new Date(raw.capturedAt).toISOString(), months: [...new Set(months)], events: events.mergeEvents(collected) };
if (!snapshot.events.length) throw new Error('Nenhum evento válido; a importação anterior foi preservada.');
fs.writeFileSync('src/data/calendar-events.json', `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify({ months:snapshot.months, events:snapshot.events.length, topics:new Set(snapshot.events.map(event => event.categoryId)).size }, null, 2));
