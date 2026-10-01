'use client';
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { EVENT_CATEGORIES, eventState, eventWindows, type EventPokemon, type GameEvent } from '@/lib/events';
import { useEventClock } from './useEventClock';
import { EventStatus, EventTiming, FavoriteButton, PokemonArt } from './EventCard';
import { eventArtIds, eventHighlights, eventTheme } from './eventPresentation';

const PokedexDetailModal = dynamic(() => import('@/components/pokedex/PokedexDetailModal'), { ssr: false });

export default function EventDetails({ event }: { event: GameEvent }) {
  const now = useEventClock();
  const [selected, setSelected] = useState<number | null>(null);
  const category = EVENT_CATEGORIES.find(c => c.id === event.categoryId);
  // Show each roster once when the same Pokémon are already featured.
  const featuredIds = new Set(event.featured?.map(p => p.id));
  const groups: [string, string, EventPokemon[] | undefined][] = [
    ['Pokémon em destaque', '✦', event.featured], ['Pokémon disponíveis', '🌿', event.pokemon],
    ['Reides', '⚔️', event.raids], ['Mega Raids', '◆', event.megaRaids],
    ['Reides de Cinco Estrelas', '⭐', event.fiveStarRaids], ['Batalhas Max', '✦', event.maxBattles?.filter(p => !featuredIds.has(p.id))],
  ];
  if (now === null) return <main className="events-shell" role="status">Carregando evento…</main>;
  const extended = event.sections?.filter(section => section.schedule && eventState({ ...event, schedule: section.schedule }, now).status === 'live') ?? [];
  return <main className="events-shell event-detail" style={eventTheme(event)}>
    <nav aria-label="Caminho do evento" className="event-breadcrumb"><Link href="/events">EVENTOS</Link><span>›</span><Link href={`/events?category=${event.categoryId}`}>{category?.name}</Link><span>›</span><span aria-current="page">{event.name}</span></nav>
    <header className="event-detail-hero">
      <div className="event-detail-art" aria-hidden="true"><span className="event-stage-orbit" /><div className={`event-art-line ${eventArtIds(event).length > 1 ? 'event-art-multiple' : ''}`}>{eventArtIds(event).length ? eventArtIds(event).map(id => <PokemonArt key={id} id={id} className="event-card-pokemon" />) : <span className="text-7xl">{category?.icon ?? "✦"}</span>}</div></div>
      <div className="event-detail-intro"><span className="event-detail-eyebrow">{category?.icon} {category?.name}</span><div className="my-3"><EventStatus event={event} now={now} /></div><h1>{event.name}</h1><p>{event.summary}</p><div className="event-highlights">{eventHighlights(event).map(item => <span key={item.text}>{item.icon} {item.text}</span>)}</div></div><FavoriteButton event={event} />
    </header>
    <section className="event-schedule-panel" aria-label="Programação"><div><h2>📅 Quando participar</h2><EventTiming event={event} now={now} /></div><div className="event-schedule-context"><span>📍 {event.schedule?.mode === 'local' ? 'Horário local' : 'Horário convertido'}</span><p>{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>{event.announced && <p>Anunciado em {new Date(`${event.announced}T12:00`).toLocaleDateString('pt-BR')}</p>}</div>
      {eventWindows(event).length > 1 && <ul className="text-sm">{eventWindows(event).map(w => <li key={w.start}>{new Date(w.start).toLocaleString('pt-BR')} → {new Date(w.end).toLocaleString('pt-BR')}</li>)}</ul>}
    </section>
    {eventState(event, now).status === 'ended' && extended.length > 0 && <aside className="event-extension-notice"><b>🧲 O evento principal terminou, mas ainda dá tempo!</b><p>{extended.map(s => s.title).join(' · ')} continuam ativos. Confira os horários abaixo.</p></aside>}
    {event.sections?.length ? <nav className="event-detail-nav" aria-label="Seções do evento">{event.sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.icon} {section.title}</a>)}</nav> : null}
    {groups.filter(([, , pokemon]) => pokemon?.length).map(([title, icon, pokemon]) => <section key={title}><div className="event-section-title"><h2>{icon} {title}</h2><span>Toque no Pokémon para abrir a Pokédex</span></div><div className="event-roster">{pokemon!.map(p => <button key={`${p.id}-${p.name}`} onClick={() => setSelected(p.id)} className="event-pokemon-tile" aria-label={`Abrir ${p.name} na Pokédex`}><div className="event-pokemon-image"><PokemonArt id={p.id} className="h-28 w-28 object-contain" />{p.shiny && <span className="event-shiny-mark" aria-label="Shiny disponível">✨</span>}</div><div>{(p.dexNumber || p.id <= 1025) && <span className="text-xs text-slate-500">#{String(p.dexNumber ?? p.id).padStart(4, '0')}</span>}<h3>{p.name}</h3><div className="event-type-list">{p.types?.map(type => <span key={type}>{type}</span>)}</div>{p.shiny && <p className="mt-2 text-xs text-amber-800">✨ Shiny disponível</p>}<span className="event-pokemon-open">Abrir Pokédex ↗</span></div></button>)}</div></section>)}
    {event.sections?.length ? <div className="event-info-grid">{event.sections.map(section => <section className={`event-info-section ${section.schedule ? 'event-info-timed' : ''}`} id={section.id} key={section.id}><header><span className="event-info-icon" aria-hidden="true">{section.icon}</span><h2>{section.title}</h2></header>{section.schedule && <div className="event-section-clock"><EventStatus event={{ ...event, schedule: section.schedule }} now={now} /><EventTiming event={{ ...event, schedule: section.schedule }} now={now} /></div>}{section.description && <p>{section.description}</p>}<ul>{section.items.map(item => <li key={item}><span aria-hidden="true">✦</span><span>{item}</span></li>)}</ul></section>)}</div> : null}
    <div className="event-info-grid">{([['⭐', 'Bônus', event.bonuses], ['🔎', 'Pesquisas', event.research], ['🎁', 'Recompensas', event.rewards], ['ℹ️', 'Informações adicionais', event.notes]] as [string, string, string[] | undefined][]).filter(([, , items]) => items?.length).map(([icon, title, items]) => <section key={title} className="event-info-section"><header><span className="event-info-icon">{icon}</span><h2>{title}</h2></header><ul>{items!.map(item => <li key={item}><span aria-hidden="true">✦</span><span>{item}</span></li>)}</ul></section>)}</div>
    <Link href={`/events?category=${event.categoryId}`} className="event-back-link">← Voltar para {category?.name}</Link>
    {selected !== null && <PokedexDetailModal key={selected} pokemonId={selected} onClose={() => setSelected(null)} onNavigate={setSelected} minId={1} maxId={1025} />}
  </main>;
}
