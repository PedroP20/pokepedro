'use client';
import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { EVENTS } from '@/lib/eventCatalog';
import { EVENT_CATEGORIES, EVENT_FILTERS, eventState, matchesFilter, matchesSearch, overlapsDay, sortEvents, type EventFilter, type GameEvent } from '@/lib/events';
import { useEventFavorites } from '@/store/useEventFavorites';
import { useEventClock } from './useEventClock';
import EventCard, { PokemonArt } from './EventCard';

function EmptyEvents({ filtered = false }: { filtered?: boolean }) {
  return <div className="event-empty"><span aria-hidden="true">✦</span><h3>{filtered ? 'Nenhum evento encontrado.' : 'Nenhum evento programado no momento.'}</h3><p>{filtered ? 'Experimente outra busca ou ajuste os filtros.' : 'Novos eventos aparecerão aqui quando forem adicionados.'}</p></div>;
}

function EventList({ events, now }: { events: GameEvent[]; now: number }) {
  const current = sortEvents(events.filter(e => eventState(e, now).status !== 'ended'), now);
  const past = sortEvents(events.filter(e => eventState(e, now).status === 'ended'), now).reverse();
  return <div className="space-y-4">{current.map(e => <EventCard key={e.id} event={e} now={now} />)}{past.length > 0 && <section className="space-y-3"><h3 className="pt-4 text-xl text-slate-600">Eventos anteriores <span className="text-sm">({past.length})</span></h3>{past.map(e => <EventCard key={e.id} event={e} now={now} />)}</section>}</div>;
}

function EventCalendar({ events, now }: { events: GameEvent[]; now: number }) {
  const [month, setMonth] = useState(() => new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1));
  const [selected, setSelected] = useState(now);
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leading = (month.getDay() + 6) % 7;
  const daily = events.filter(e => overlapsDay(e, selected));
  function move(amount: number) {
    const date = new Date(month.getFullYear(), month.getMonth() + amount, 1);
    setMonth(date); setSelected(date.getTime());
  }
  return <section className="event-calendar"><div className="flex items-center justify-between gap-2"><button className="event-control" aria-label="Mês anterior" onClick={() => move(-1)}>←</button><h3 className="text-lg capitalize">{month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3><button className="event-control" aria-label="Próximo mês" onClick={() => move(1)}>→</button></div><button className="my-2 text-sm font-bold text-[#1B4F9C]" onClick={() => { setMonth(new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1)); setSelected(now); }}>Voltar para hoje</button>
    <div className="event-calendar-grid">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => <span key={day} className="py-2 text-center text-xs text-slate-500">{day}</span>)}{Array.from({ length: leading }, (_, i) => <span key={`empty-${i}`} />)}{Array.from({ length: count }, (_, i) => {
      const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
      const number = events.filter(e => overlapsDay(e, date.getTime())).length;
      const chosen = date.toDateString() === new Date(selected).toDateString();
      return <button key={i} className={`event-calendar-day ${chosen ? 'selected' : ''}`} aria-pressed={chosen} aria-label={`${date.toLocaleDateString('pt-BR')}, ${number} eventos`} onClick={() => setSelected(date.getTime())}><span>{i + 1}</span>{number > 0 && <span className="event-calendar-dot" />}</button>;
    })}</div><h3 className="mb-4 mt-6 text-lg">{new Date(selected).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</h3>{daily.length ? <EventList events={daily} now={now} /> : <EmptyEvents />}
  </section>;
}

export default function EventsHub() {
  const params = useSearchParams();
  const router = useRouter();
  const categoryId = params.get('category');
  const category = EVENT_CATEGORIES.find(c => c.id === categoryId);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<EventFilter>('all');
  const [view, setView] = useState<'wallet' | 'calendar'>('wallet');
  const now = useEventClock();
  const favorites = useEventFavorites(s => s.ids);
  if (now === null) return <main className="events-shell"><p className="event-empty" role="status">Preparando sua central de eventos…</p></main>;
  const live = EVENTS.filter(e => eventState(e, now).status === 'live');
  const next = sortEvents(EVENTS.filter(e => eventState(e, now).next), now)[0];
  const filtered = EVENTS.filter(e => matchesFilter(e, filter, now, favorites) && matchesSearch(e, query) && (!category || (category.id === 'live' ? eventState(e, now).status === 'live' : e.categoryId === category.id)));
  const isFiltering = filter !== 'all' || !!query.trim();
  return <main className="events-shell">
    <header className="events-hero"><div className="events-hero-copy"><span className="events-eyebrow">POKÉMON GO · SUA PRÓXIMA AVENTURA</span><h1>EVENTOS<span className="text-[#FFCB05]">.</span></h1><p>Encontre seu próximo encontro.</p><p className="events-hero-description">Explore os eventos, prepare seu time e aproveite cada momento.</p><div className="events-hero-stats"><span><b>{live.length}</b> ao vivo</span><span><b>{EVENTS.filter(e => overlapsDay(e, now)).length}</b> hoje</span><span><b>{EVENT_CATEGORIES.length - 1}</b> categorias</span></div></div><PokemonArt id={25} className="events-hero-art" /><span className="events-orbit" aria-hidden="true" /></header>
    <div className="event-timezone"><span>◷ {new Date(now).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span><span>Horários no seu fuso: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span></div>
    {!category && <section className="space-y-3" aria-label="Destaques"><div className="event-section-title"><h2>{live.length ? '🔴 Acontecendo agora' : '✦ Próximo evento'}</h2><span>Atualizado automaticamente</span></div>{live.length ? live.map(e => <EventCard key={e.id} event={e} now={now} />) : next ? <EventCard event={next} now={now} /> : <div className="event-notice">Nenhum evento ativo ou próximo cadastrado. Explore as categorias e os eventos anteriores abaixo.</div>}</section>}
    <section className="event-tools" aria-label="Busca e filtros"><label htmlFor="event-search" className="sr-only">Buscar evento ou Pokémon</label><div className="event-search"><span aria-hidden="true">⌕</span><input id="event-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar evento ou Pokémon…" /></div><div className="event-filter-row">{EVENT_FILTERS.map(([id, label]) => <button key={id} aria-pressed={filter === id} className={`event-chip ${filter === id ? 'selected' : ''}`} onClick={() => setFilter(id)}>{label}</button>)}</div><div className="flex flex-wrap items-center justify-between gap-3"><label className="event-category-field flex min-w-0 flex-1 items-center gap-2 text-sm"><span className="sr-only">Categoria</span><select aria-label="Filtrar por categoria" className="event-category-select" value={category?.id || ''} onChange={e => { router.push(e.target.value ? `/events?category=${e.target.value}` : '/events'); }}><option value="">Todas as categorias</option>{EVENT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><div className="event-view-switch" aria-label="Visualização"><button aria-pressed={view === 'wallet'} onClick={() => setView('wallet')}>▤ Carteira</button><button aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}>▦ Calendário</button></div></div></section>
    {category && <div className="space-y-3"><Link href="/events" className="text-sm font-bold text-[#1B4F9C]">← Todas as categorias</Link><h2 className="text-2xl text-[#1B4F9C]">{category.icon} {category.name}</h2><p className="text-sm text-slate-500">{filtered.length} evento(s) · ordenados por data e horário</p></div>}
    {view === 'calendar' ? <EventCalendar events={filtered} now={now} /> : category || isFiltering ? <section aria-label="Resultados da busca"><div className="mb-3 flex items-center justify-between"><span className="text-sm text-slate-500">{filtered.length} evento(s) encontrado(s)</span>{isFiltering && <button className="event-control" onClick={() => { setQuery(''); setFilter('all'); }}>Limpar filtros</button>}</div>{filtered.length ? <EventList events={filtered} now={now} /> : <EmptyEvents filtered={isFiltering} />}</section> : <section aria-label="Carteira de categorias"><div className="event-section-title"><div><h2>Sua carteira de eventos</h2><p>Deslize para explorar. Toque para abrir.</p></div><span>{EVENT_CATEGORIES.length} cartões</span></div><div className="event-wallet">{EVENT_CATEGORIES.map((c, index) => {
      const items = EVENTS.filter(e => c.id === 'live' ? eventState(e, now).status === 'live' : e.categoryId === c.id);
      const active = items.filter(e => eventState(e, now).status === 'live').length;
      const upcoming = sortEvents(items.filter(e => eventState(e, now).next), now)[0];
      const start = upcoming && eventState(upcoming, now).next?.start;
      return <Link href={`/events?category=${c.id}`} key={c.id} className="event-wallet-card" style={{ '--card-color': c.color, '--card-index': index } as CSSProperties}><div className="event-wallet-content"><div className="event-wallet-top"><span className="event-wallet-icon" aria-hidden="true">{c.icon}</span><span className="event-wallet-number">{String(index + 1).padStart(2, '0')} / {String(EVENT_CATEGORIES.length).padStart(2, '0')}</span></div><h3>{c.name}</h3><p className="event-wallet-description">{c.description}</p><div className="event-wallet-meta"><span>{active ? `● ${active} ao vivo` : start ? `Próximo: ${new Date(start).toLocaleDateString('pt-BR')}` : 'Sem novos eventos programados'}</span><span>{items.length} evento(s) disponível(is) <b>↗</b></span></div></div><PokemonArt id={c.pokemonId} className="event-wallet-art" /></Link>;
    })}</div><p className="mt-5 text-center text-xs text-slate-500">As artes das categorias são ilustrativas. Consulte os participantes dentro de cada evento.</p></section>}
  </main>;
}
