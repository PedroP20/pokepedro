import { Suspense } from 'react';
import EventsHub from '@/components/events/EventsHub';
import './events.css';

export const metadata = { title: 'Eventos Pokémon GO | PokéPedro' };
export default function EventsPage() {
  return <Suspense fallback={<main className="events-shell">Carregando eventos…</main>}><EventsHub /></Suspense>;
}
