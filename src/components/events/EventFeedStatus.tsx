'use client';
import type { EventFeed } from '@/lib/events';

export default function EventFeedStatus({ feed, busy, error, now, refresh }: { feed?: EventFeed; busy: boolean; error: boolean; now: number; refresh: () => void }) {
  const stale = !feed?.updatedAt || now - Date.parse(feed.updatedAt) > 2 * 60 * 60_000;
  const fallback = error || feed?.health === 'fallback' || stale;
  const snapshot = feed?.coverage === 'calendar-snapshot';
  const calendarDate = feed?.diagnostics?.calendarCheckedAt;
  const displayDate = (date: string) => new Date(date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  return <aside className="event-source-panel" aria-label="Fonte e atualização da agenda">
    <div className="event-source-heading"><span className={`event-source-dot ${busy ? 'is-syncing' : fallback ? 'is-offline' : ''}`} aria-hidden="true" /><b>{busy ? 'Atualizando os anúncios…' : fallback ? 'Última agenda disponível' : snapshot ? 'Calendário importado · anúncios atualizados' : 'Agenda sincronizada'}</b>{feed?.updatedAt && <span>Anúncios consultados em {displayDate(feed.updatedAt)}</span>}</div>
    <p>{snapshot ? `Calendário oficial importado${calendarDate ? ` em ${displayDate(calendarDate)}` : ''}, com todos os tópicos dos ${feed?.diagnostics?.calendarMonths?.length ?? 0} meses consultados. Os anúncios públicos continuam sendo atualizados automaticamente. Novos eventos exclusivos do calendário exigem uma nova consulta autenticada.` : feed?.coverage === 'calendar' ? 'Programação dos meses e tópicos disponíveis no calendário oficial do Pokémon GO.' : 'Agenda baseada nos anúncios públicos do Pokémon GO. Consulte o calendário oficial para a programação completa.'} Eventos encerrados ficam disponíveis por 7 dias.</p>
    <div className="event-source-links"><a href={feed?.sourceUrl ?? 'https://pokemongo.com/pt-BR/news'} target="_blank" rel="noopener noreferrer">Anúncios oficiais ↗</a><a href={feed?.calendarUrl ?? 'https://pokemongo.com/pt-BR/events'} target="_blank" rel="noopener noreferrer">Calendário oficial ↗</a>{fallback && !busy && <button type="button" onClick={refresh}>Tentar atualizar ↻</button>}</div>
  </aside>;
}
