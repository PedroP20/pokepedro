'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { countdown, eventState, EVENT_CATEGORIES, type GameEvent } from '@/lib/events';
import { useEventFavorites } from '@/store/useEventFavorites';
import { eventArtIds, eventHighlights, eventTheme } from './eventPresentation';

export function PokemonArt({ id, className = '' }: { id: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span aria-hidden="true" className={className}>✦</span> : <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`} alt="" width={180} height={180} className={className} loading="lazy" unoptimized onError={() => setFailed(true)} />;
}
export function EventStatus({ event, now }: { event: GameEvent; now: number }) {
  const { status } = eventState(event, now);
  const labels: Record<string, string> = { live: 'AO VIVO', today: 'HOJE', upcoming: 'EM BREVE', ended: 'ENCERRADO', unscheduled: 'DATA A CONFIRMAR' };
  return <span className={`event-status event-status-${status}`}>{status === 'live' && <span className="event-live-dot" />}{labels[status]}</span>;
}
export function EventTiming({ event, now }: { event: GameEvent; now: number }) {
  const { active, next, windows } = eventState(event, now);
  const window = active ?? next ?? windows[windows.length - 1];
  if (!window) return <p className="text-sm text-slate-600">Data e horário serão informados.</p>;
  const start = new Date(window.start), end = new Date(window.end);
  const allDay = start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 0 && end.getMinutes() === 0;
  const displayEnd = new Date(window.end - (allDay ? 60_000 : 0));
  const day = (date: Date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hour = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return <div className="event-timing"><div className="event-date-row">{!allDay && day(start) !== day(displayEnd) ? <><span>📅 Início: {day(start)}, {hour(start)}</span><span>🏁 Fim: {day(displayEnd)}, {hour(displayEnd)}</span></> : <><span>📅 {day(start)}{day(start) !== day(displayEnd) && ` → ${day(displayEnd)}`}</span><span>◷ {allDay ? 'Dia todo · 00:00–23:59' : `${hour(start)}–${hour(displayEnd)}`}</span></>}</div><p className="event-countdown">{active ? `● Termina em ${countdown(active.end - now)}` : next ? `◷ Começa em ${countdown(next.start - now)}` : '✓ Evento encerrado'}</p></div>;
}
export function FavoriteButton({ event }: { event: GameEvent }) {
  const { ids, toggle } = useEventFavorites();
  const favorite = ids.includes(event.id);
  return <button type="button" aria-pressed={favorite} aria-label={`${favorite ? 'Desfavoritar' : 'Favoritar'} ${event.name}`} onClick={() => toggle(event.id)} className={`event-favorite ${favorite ? 'is-favorite' : ''}`}>{favorite ? '★' : '☆'}</button>;
}
export default function EventCard({ event, now }: { event: GameEvent; now: number }) {
  const category = EVENT_CATEGORIES.find(c => c.id === event.categoryId);
  return <article style={eventTheme(event)} className={`event-item event-designed-card ${eventState(event, now).status === 'live' ? 'event-item-live' : ''}`}>
    <Link href={`/events/${event.id}`} className="event-designed-link">
      <div className="event-card-stage" aria-hidden="true"><span className="event-stage-orbit" /><span className="event-stage-category">{category?.icon} {event.categoryId === 'max' ? 'DINAMAX' : event.categoryId === 'community-classic' ? 'DIA COMUNITÁRIO' : 'POKÉMON GO'}</span><div className={`event-art-line ${eventArtIds(event).length > 1 ? 'event-art-multiple' : ''}`}>{eventArtIds(event).length ? eventArtIds(event).map(id => <PokemonArt key={id} id={id} className="event-card-pokemon" />) : <span className="text-7xl">{category?.icon ?? '✦'}</span>}</div><span className="event-stage-spark">✦</span></div>
      <div className="event-card-copy"><div className="event-card-kicker"><EventStatus event={event} now={now} /><span>{category?.icon} {category?.name}</span></div><h3>{event.name}</h3><p className="event-card-summary">{event.summary}</p><EventTiming event={event} now={now} /><div className="event-highlights">{eventHighlights(event).map(item => <span key={item.text}>{item.icon} {item.text}</span>)}</div><div className="event-card-footer"><span>📍 {event.schedule?.mode === 'local' ? 'Horário local' : 'Horários no seu fuso'}</span><strong>Explorar evento <span aria-hidden="true">↗</span></strong></div></div>
    </Link><FavoriteButton event={event} />
  </article>;
}
