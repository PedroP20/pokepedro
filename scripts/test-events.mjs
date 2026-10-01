import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

(async () => {
  const source = fs.readFileSync('src/lib/events.ts', 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
  const { eventState, eventWindows, overlapsDay, matchesFilter, matchesSearch, sortEvents } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
  const gibleSource = ts.transpileModule(fs.readFileSync('src/lib/eventGible.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
  const { GIBLE_COMMUNITY_CLASSIC: gible } = await import(`data:text/javascript;base64,${Buffer.from(gibleSource).toString('base64')}`);
  const staraptorSource = ts.transpileModule(fs.readFileSync('src/lib/eventStaraptor.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
  const { STARAPTOR_SUPER_MEGA: staraptor } = await import(`data:text/javascript;base64,${Buffer.from(staraptorSource).toString('base64')}`);
  const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText).toString('base64')}`;
  const goFestUrl = moduleUrl(fs.readFileSync('src/lib/goFest2026.ts', 'utf8'));
  const september = await import(moduleUrl(fs.readFileSync('src/lib/eventsSeptember.ts', 'utf8').replace("'./goFest2026'", JSON.stringify(goFestUrl))));
  const { SEPTEMBER_ROTATIONS: rotations } = await import(moduleUrl(fs.readFileSync('src/lib/eventRotationsSeptember.ts', 'utf8').replace("'./events'", JSON.stringify(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`))));
  assert.equal(rotations.length, 34);
  assert.equal(new Set(rotations.map(e => e.id)).size, 34);
  assert.deepEqual(Object.fromEntries(['raid-hour', 'spotlight', 'mega', 'go-battle', 'five-star', 'shadow', 'max-monday', 'friendship', 'showcase'].map(id => [id, rotations.filter(e => e.categoryId === id).length])), { 'raid-hour': 4, spotlight: 3, mega: 6, 'go-battle': 3, 'five-star': 5, shadow: 2, 'max-monday': 4, friendship: 3, showcase: 4 });
  const event = { id: 'test', name: 'Hora de Holofote', summary: '', categoryId: 'spotlight', pokemon: [{ id: 384, name: 'Rayquaza' }], schedule: { mode: 'local', windows: [{ start: '2026-09-04T18:00', end: '2026-09-04T19:00' }] } };
  for (const zone of ['America/Sao_Paulo', 'Asia/Tokyo', 'America/New_York']) {
    process.env.TZ = zone;
    const time = value => new Date(`2026-09-04T${value}`).getTime();
    for (const rotation of rotations) {
      const windows = eventWindows(rotation);
      assert.equal(windows.length, 1);
      assert.equal(eventState(rotation, windows[0].start).status, 'live');
      assert.equal(eventState(rotation, windows[0].end - 1).status, 'live');
      assert.equal(eventState(rotation, windows[0].end).status, 'ended');
    }
    const thundurus = rotations.find(e => e.id === 'sombrosos-thundurus-2026-09');
    assert.equal(eventState(thundurus, new Date('2026-10-06T23:59:59').getTime()).status, 'live');
    assert.equal(eventState(thundurus, new Date('2026-10-07T00:00').getTime()).status, 'ended');
    for (const sunday of september.SCENERY_SUNDAYS) {
      const [window] = eventWindows(sunday);
      assert.equal(eventState(sunday, window.end - 1).status, 'live');
      assert.equal(eventState(sunday, window.end).status, 'ended');
      assert.equal(overlapsDay(sunday, window.end), false);
    }
    const squads = september.MEGA_SQUADS;
    const firstEggs = { ...squads, schedule: squads.sections.find(s => s.id === 'ovos-primeira').schedule };
    const secondEggs = { ...squads, schedule: squads.sections.find(s => s.id === 'ovos-segunda').schedule };
    const switchTime = new Date('2026-09-11T10:00').getTime();
    assert.equal(eventState(firstEggs, switchTime).status, 'ended');
    assert.equal(eventState(secondEggs, switchTime).status, 'live');
    assert.equal(eventState(september.PHANTUMP_CATCH_MASTERY, new Date('2026-09-26T20:00').getTime()).status, 'ended');
    assert.equal(matchesSearch(squads, 'Emolga'), true);
    const [ascension, finale] = september.GOFEST_PHASES;
    const boundary = Date.parse('2026-09-05T00:00:00-03:00');
    assert.equal(eventState(ascension, boundary).status, 'ended');
    assert.equal(eventState(finale, boundary).status, 'live');
    assert.equal(eventState(staraptor, new Date('2026-09-19T14:00').getTime()).status, 'live');
    assert.equal(eventState(staraptor, new Date('2026-09-19T17:00').getTime()).status, 'ended');
    const remoteRaids = { ...staraptor, schedule: staraptor.sections.find(s => s.id === 'reides-distancia').schedule };
    assert.equal(eventState(remoteRaids, Date.parse('2026-09-18T20:59:59-03:00')).status === 'live', false);
    assert.equal(eventState(remoteRaids, Date.parse('2026-09-18T21:00:00-03:00')).status, 'live');
    assert.equal(eventState(remoteRaids, Date.parse('2026-09-19T23:59:59-03:00')).status, 'live');
    assert.equal(eventState(remoteRaids, Date.parse('2026-09-20T00:00:00-03:00')).status, 'ended');
    const gibleTime = value => new Date(`2026-09-12T${value}`).getTime();
    assert.equal(eventState(gible, gibleTime('14:00')).status, 'live');
    assert.equal(eventState(gible, gibleTime('17:00')).status, 'ended');
    for (const section of gible.sections.filter(s => s.schedule)) {
      const benefit = { ...gible, schedule: section.schedule };
      assert.equal(eventState(benefit, gibleTime('17:00')).status, 'live');
      assert.equal(eventState(benefit, gibleTime('20:59:59')).status, 'live');
      assert.equal(eventState(benefit, gibleTime('21:00')).status, 'ended');
    }
    assert.equal(eventState(event, time('17:59:59')).status, 'today');
    assert.equal(eventState(event, time('18:00:00')).status, 'live');
    assert.equal(eventState(event, time('18:37:00')).status, 'live');
    assert.equal(eventState(event, time('19:00:00')).status, 'ended');
    assert.equal(matchesFilter(event, 'tomorrow', new Date('2026-09-03T23:59').getTime(), []), true);
    assert.equal(matchesFilter(event, 'favorites', time('18:37'), ['test']), true);
    assert.equal(matchesFilter(event, 'favorites', time('18:37'), []), false);
    assert.equal(matchesFilter(event, 'week', time('18:37'), []), true);
    const overnight = { ...event, schedule: { mode: 'local', windows: [{ start: '2026-09-04T23:30', end: '2026-09-05T00:30' }] } };
    assert.equal(overlapsDay(overnight, new Date('2026-09-05T12:00').getTime()), true);
    const midnightEnd = { ...event, schedule: { mode: 'local', windows: [{ start: '2026-09-04T23:00', end: '2026-09-05T00:00' }] } };
    assert.equal(overlapsDay(midnightEnd, new Date('2026-09-05T12:00').getTime()), false);
    const split = { ...event, schedule: { mode: 'local', windows: [...event.schedule.windows, { start: '2026-09-06T18:00', end: '2026-09-06T19:00' }] } };
    assert.equal(eventState(split, new Date('2026-09-05T18:30').getTime()).status, 'upcoming');
    assert.equal(sortEvents([overnight, event], time('16:00'))[0], event);
  }
  const absolute = { ...event, schedule: { mode: 'absolute', windows: [{ start: '2026-09-04T18:00:00-03:00', end: '2026-09-04T19:00:00-03:00' }] } };
  assert.equal(eventState(absolute, Date.parse('2026-09-04T21:37:00Z')).status, 'live');
  assert.equal(eventState(absolute, Date.parse('2026-09-04T22:00:00Z')).status, 'ended');
  assert.equal(eventWindows({ ...event, schedule: { ...event.schedule, mode: 'absolute' } }).length, 0);
  assert.equal(eventWindows({ ...event, schedule: { mode: 'local', windows: [{ start: '2026-02-30T18:00', end: '2026-03-03T19:00' }] } }).length, 0);
  assert.equal(eventState({ ...event, schedule: undefined }, Date.now()).status, 'unscheduled');
  assert.equal(matchesSearch(event, 'rayquaza'), true);
  assert.equal(matchesSearch(event, 'holofóte'), true);
  assert.equal(matchesSearch(event, 'gengar'), false);
  // A local session crossing DST uses elapsed time, not naive hour subtraction.
  process.env.TZ = 'America/New_York';
  const dst = { ...event, schedule: { mode: 'local', windows: [{ start: '2026-03-08T01:30', end: '2026-03-08T03:30' }] } };
  const [window] = eventWindows(dst);
  assert.equal(window.end - window.start, 3600000);
  console.log('Event timing, boundaries, time zones, DST, filters and search: passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
