import type { CSSProperties } from 'react';
import { EVENT_CATEGORIES, type GameEvent } from '@/lib/events';

// Artwork-inspired accents, with dark text colors for readable badges.
const PALETTES: Record<number, [string, string]> = {
  25: ['#956000', '#fff3bd'], 133: ['#82512e', '#f9ead4'],
  280: ['#477840', '#eaf4e1'], 111: ['#616476', '#ebeaf1'],
  144: ['#216d9b', '#e1f4ff'], 145: ['#916300', '#fff4bf'],
  146: ['#b34827', '#ffead7'], 816: ['#267ba0', '#dff5ff'],
  443: ['#355994', '#e7edfb'],
  398: ['#614b55', '#f3e7e8'],
  942: ['#815732', '#f7ecd9'], 4: ['#a64c22', '#ffeddf'],
  708: ['#5b5278', '#eee8f6'], 10061: ['#315d95', '#e6effb'],
  150: ['#6b4295', '#eee5fa'],
  888: ['#276889', '#e3f4fa'], 889: ['#924357', '#fae8ec'],
  794: ['#a04332', '#fce8e3'], 716: ['#36578f', '#e8effb'],
  13: ['#89652c', '#faf0d9'], 228: ['#75504a', '#f4e9e6'],
  19: ['#775187', '#f1e8f6'], 10041: ['#33658c', '#e4f0fa'],
  10090: ['#886721', '#faf2d9'], 10048: ['#785048', '#f7e9e3'],
  10033: ['#337b66', '#e3f5e9'], 687: ['#674989', '#f0e8f8'],
  71: ['#68722d', '#f2f5d9'], 377: ['#875d3e', '#f7edde'],
  487: ['#75602c', '#f5efda'], 642: ['#596a97', '#e9effa'],
};
export function eventArtIds(event: GameEvent) {
  return [...new Set([...(event.featured?.map(p => p.id) || []), ...(event.maxBattles?.map(p => p.id) || []), ...(event.imageId ? [event.imageId] : [])])].slice(0, 3);
}
export function eventTheme(event: GameEvent): CSSProperties {
  const [accent, tint] = PALETTES[event.imageId ?? 0] ?? [EVENT_CATEGORIES.find(c => c.id === event.categoryId)?.color ?? '#1b4f9c', '#edf3fc'];
  return { '--event-accent': accent, '--event-tint': tint } as CSSProperties;
}
export function eventHighlights(event: GameEvent) {
  if (event.highlights?.length) return event.highlights;
  const pokemon = event.featured?.length ? event.featured : event.maxBattles ?? event.pokemon ?? [];
  return pokemon.slice(0, 3).map(p => ({ icon: event.categoryId === 'max' ? '✦' : '◈', text: p.name }));
}
