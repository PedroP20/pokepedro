import type { CSSProperties } from 'react';
import { POKEMON_TYPES } from '@/lib/typeEffectiveness';
export const TYPE_COLORS: Record<string, string> = { Normal: '#747582', Fogo: '#df5736', Água: '#3479c7', Planta: '#438a58', Elétrico: '#9b7500', Gelo: '#278997', Lutador: '#b54b47', Venenoso: '#9754b4', Terrestre: '#98652f', Voador: '#7375bd', Psíquico: '#ce5286', Inseto: '#718a2a', Pedra: '#857443', Fantasma: '#68558e', Dragão: '#5966be', Aço: '#5d7b8e', Sombrio: '#545167', Fada: '#c86095' };
export function typeStyle(type: string): CSSProperties { return { '--type-color': TYPE_COLORS[type] || '#747582' } as CSSProperties; }
export default function TypeBadge({ type }: { type: string }) {
  const info = POKEMON_TYPES[type];
  return <span className="type-badge" style={typeStyle(type)}><span aria-hidden="true">{info?.icon || '◉'}</span>{info?.name || type}</span>;
}
