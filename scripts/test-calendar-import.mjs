import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadEventImporter } from './event-importer-loader.mjs';

const { importer, events } = await loadEventImporter();
const now = new Date('2026-10-07T12:00:00Z');
const checkedAt = '2026-10-07T10:00:00Z';
const october = importer.officialCalendarUrl(now);
const november = 'https://pokemongo.com/pt-BR/events/november-2026';
const december = 'https://pokemongo.com/pt-BR/events/december-2026';
const articleUrl = 'https://pokemongo.com/pt-BR/news/example';
const catalog = [{ id:25, name:'Pikachu', types:['electric'] }];
const record = (id, topic=2, start='2026-10-10T14:00Z', end='2026-10-10T17:00Z') => ({
  eventId:String(id), title:'Pikachu Batalhas Max', startTimeUnixMs:Date.parse(start), endTimeUnixMs:Date.parse(end),
  eventType:{eventTypeId:topic,name:topic===2?'Batalhas Max':'Novo tópico'},
  imageUrl:'https://assets.pgo.gamesite.scopelyexplore.com/events/key-art/example.jpg',
  campfireLiveEvent:{pokemonImageEntries:[{nameKey:'Pikachu',imageUrl:'https://storage.googleapis.com/pgorelease-assets/Campfire/PokemonIcons/pm25_example.png'}]},
  rsvpedMeetup:{address:'PRIVATE_LOCATION'}, playerProfile:{name:'PRIVATE_ACCOUNT'},
});
const calendar = (records, next=null, previous=null) => {
  const frames = `a:${JSON.stringify({calendarEvents:{events:records},nextMonthSlug:next,prevMonthSlug:previous,account:'PRIVATE_ACCOUNT'})}\n`;
  // Real documents split RSC frames over independently encoded script chunks.
  const split = Math.floor(frames.length/2);
  return `<main></main>${[frames.slice(0,split),frames.slice(split)].map(chunk=>`<script>self.__next_f.push(${JSON.stringify([1,chunk])})</script>`).join('')}`;
};
const parsed = importer.parseCalendar(calendar([record(1)]), october, checkedAt, catalog).events[0];
assert.equal(parsed.id,'official-calendar-1');
assert.equal(parsed.categoryId,'max');
assert.equal(parsed.schedule.mode,'local');
assert.equal(parsed.schedule.windows[0].start,'2026-10-10T14:00');
assert.equal(parsed.featured[0].id,25);
assert.equal(parsed.images.length,2);
assert.equal(JSON.stringify(parsed).includes('PRIVATE_'),false);
assert.equal(importer.parseCalendarRecords([record(1)],'https://evil.test/events/october-2026',checkedAt,catalog).length,0);
assert.equal(importer.parseCalendarRecords([{...record(1),startTimeUnixMs:Infinity}],october,checkedAt,catalog).length,0);
assert.equal(importer.parseCalendarRecords([{...record(1),eventId:'../../invalid'}],october,checkedAt,catalog).length,0);
const allDay = importer.parseCalendarRecords([record(2,24,'2026-10-08T00:00Z','2026-10-08T23:59Z')],october,checkedAt,catalog)[0];
assert.equal(allDay.categoryId,'go-battle');
assert.equal(allDay.schedule.windows[0].end,'2026-10-09T00:00');
const newTopic = importer.parseCalendarRecords([record(3,99)],october,checkedAt,catalog)[0];
assert.equal(newTopic.categoryId,'official-type-99');
assert.equal(events.categoriesForEvents([newTopic]).find(c=>c.id==='official-type-99').name,'Novo tópico');
assert.equal(events.matchesSearch(newTopic,'Novo tópico'),true);
const article = `<main><article><script type="application/ld+json">${JSON.stringify({'@type':'NewsArticle',headline:'Pikachu em destaque',datePublished:'2026-09-30'})}</script><h2>Pikachu em destaque</h2><p>10 de outubro de 2026, das 14h às 17h, horário local</p><h2>Bônus</h2><p>2× PE por captura</p></article></main>`;
const news = importer.parseNewsArticle(article,articleUrl,catalog,now.toISOString());
const withBlog = importer.parseCalendarRecords([{...record(4),blogUrl:articleUrl}],october,checkedAt,catalog)[0];
const combined = importer.mergeOfficialEvents([withBlog],[news]);
assert.equal(combined.length,1);
assert.equal(combined[0].id,'official-calendar-4');
assert.equal(combined[0].name,news.name);
assert.equal(combined[0].categoryId,'max');
assert.equal(combined[0].aliases.includes(news.id),true);
assert.equal(combined[0].sections.some(s=>s.title==='Bônus'),true);
assert.equal(combined[0].source.checkedAt,checkedAt);
assert.equal(events.matchesFilter(combined[0],'favorites',now.getTime(),[news.id]),true);
// Different weekly occurrences sharing a blog URL must remain distinct.
const other = importer.parseCalendarRecords([{...record(5,2,'2026-10-17T14:00Z','2026-10-17T17:00Z'),blogUrl:articleUrl}],october,checkedAt,catalog)[0];
assert.equal(importer.mergeOfficialEvents([withBlog,other],[news]).length,2);
assert.equal(events.mergeEvents([parsed],[{...parsed,source:undefined,id:'manual',name:'Pikachu — Batalhas Max'}]).length,1);
const oldAliases = events.mergeEvents([parsed],[{...parsed,source:undefined,id:'manual-1'},{...parsed,source:undefined,id:'manual-2'}])[0].aliases;
assert.deepEqual(oldAliases,['manual-1','manual-2']);
const index = `<main><a href="${articleUrl}">Evento</a></main>`;
const requested = [];
const feed = await importer.importOfficialEvents(async url=>{
  requested.push(url);
  if(url===october)return calendar([record(1)],'november-2026');
  if(url===november)return calendar([record(1),record(6,21,'2026-11-11T18:00Z','2026-11-11T19:00Z')],'december-2026','october-2026');
  if(url===december)return calendar([record(7,22,'2026-12-03T18:00Z','2026-12-03T19:00Z')],null,'november-2026');
  return url===importer.OFFICIAL_NEWS_URL?index:article;
},catalog,now);
assert.deepEqual(feed.diagnostics.calendarMonths,['october-2026','november-2026','december-2026']);
assert.equal(feed.diagnostics.calendarImported,3);
assert.equal(new Set(requested).size,requested.length);
assert.equal(feed.coverage,'calendar');
const saved = {events:[withBlog],checkedAt,months:['october-2026']};
const snapshotFeed = await importer.importOfficialEvents(async url=>url.includes('/events/')?'<main>Faça login com sua conta Pokémon GO para ver Eventos</main>':url===importer.OFFICIAL_NEWS_URL?index:article,catalog,now,saved);
assert.equal(snapshotFeed.coverage,'calendar-snapshot');
assert.equal(snapshotFeed.diagnostics.calendarCheckedAt,checkedAt);
assert.notEqual(snapshotFeed.diagnostics.calendarCheckedAt,snapshotFeed.updatedAt);
assert.equal(snapshotFeed.diagnostics.calendarRequiresLogin,true);
// A broken official article is handled without losing its calendar event.
const missing = await importer.importOfficialEvents(async url=>{
  if(url.includes('/events/')) return '<main>Faça login com sua conta Pokémon GO para ver Eventos</main>';
  if(url===importer.OFFICIAL_NEWS_URL)return index;
  throw new importer.OfficialSourceError(404,url);
},catalog,now,saved);
assert.equal(missing.events.length,1);
assert.equal(missing.events[0].source.url,october);
assert.equal(missing.diagnostics.unavailableArticles,1);
const aliasSnapshot = { ...saved, events:[{...withBlog,source:{...withBlog.source,url:'https://pokemongolive.com/pt-BR/news/example'}}] };
const absentAlias = await importer.importOfficialEvents(async url=>{
  if(url.includes('/events/')) return '<main>Faça login com sua conta Pokémon GO para ver Eventos</main>';
  if(url===importer.OFFICIAL_NEWS_URL)return index;
  throw new importer.OfficialSourceError(404,url);
},catalog,now,aliasSnapshot);
assert.equal(absentAlias.events[0].source.url,october);
const manyLinks = `<main>${Array.from({length:55},(_,i)=>`<a href="/pt-BR/news/event-${i}">Evento</a>`).join('')}</main>`;
assert.equal(importer.parseNewsIndex(manyLinks).length,55);
assert.equal(importer.parseNewsIndex(`<main><a href="${articleUrl}">Evento</a><a href="${articleUrl}/">Evento</a></main>`).length,1);
const rollover = importer.parseNewsArticle(article.replace('10 de outubro de 2026, das 14h às 17h, horário local','11 de dezembro, das 14h às 17h, horário local</p><p>3 de maio, das 14h às 17h, horário local</p><p>28 de julho de 2027, das 14h às 17h, horário local'),articleUrl,catalog,checkedAt);
assert.deepEqual(rollover.schedule.windows.map(w=>w.start.slice(0,10)),['2026-12-11','2027-05-03','2027-07-28']);
const realSnapshot = JSON.parse(fs.readFileSync('src/data/calendar-events.json','utf8'));
assert.equal(realSnapshot.events.length>0,true);
assert.equal(new Set(realSnapshot.events.map(event=>event.id)).size,realSnapshot.events.length);
assert.equal(realSnapshot.events.every(event=>event.officialTopic?.id>0),true);
assert.equal(realSnapshot.events.every(event=>event.schedule.mode==='local'),true);
assert.equal(JSON.stringify(realSnapshot).includes('rsvpedMeetup'),false);
console.log('Calendar months, official topics, recurrence, images, privacy, deduplication, snapshots, missing articles and year rollover passed.');
