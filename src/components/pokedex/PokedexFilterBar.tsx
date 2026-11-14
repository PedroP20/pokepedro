"use client";
import { useState } from 'react';
import type { PokedexFilters } from '@/types/pokemon';
import { POKEMON_TYPES } from '@/lib/typeEffectiveness';
import ClubIcon from '@/components/ui/ClubIcon';
import { typeStyle } from '@/components/ui/TypeBadge';
export default function PokedexFilterBar({ filters, onChange, onReset, totalResults }: { filters: PokedexFilters; onChange: (filters: PokedexFilters) => void; onReset: () => void; totalResults: number }) {
  const [expanded, setExpanded] = useState(false);
  const count = filters.selectedTypes.length + Number(filters.sortBy !== 'ID') + Number(filters.evolutionStatus !== 'ALL');
  const toggleType = (type: string) => {
    const types = filters.selectedTypes.includes(type) ? filters.selectedTypes.filter(t => t !== type) : [...filters.selectedTypes.slice(0, 1), type];
    onChange({ ...filters, selectedTypes: types });
  };
  return <section className="pokedex-filters">
    <div className="dex-search-row"><label className="dex-search"><ClubIcon name="search"/><input aria-label="Pesquisar nome ou número da Pokédex" type="search" placeholder="Qual Pokémon você procura?" value={filters.searchTerm} onChange={e => onChange({ ...filters, searchTerm: e.target.value })}/></label><button className={`filter-toggle ${expanded ? 'is-active' : ''}`} onClick={() => setExpanded(v => !v)} aria-expanded={expanded} aria-controls="dex-advanced"><span aria-hidden="true">☷</span> Filtros {count > 0 && <b>{count}</b>}<span>{expanded ? '−' : '+'}</span></button><label className="dex-sort"><span className="sr-only">Ordenar Pokémon</span><select value={filters.sortBy} onChange={e => onChange({ ...filters, sortBy: e.target.value as PokedexFilters['sortBy'] })}><option value="ID">Número da Pokédex</option><option value="HEIGHT_ASC">Menor altura</option><option value="HEIGHT_DESC">Maior altura</option><option value="WEIGHT_ASC">Menor peso</option><option value="WEIGHT_DESC">Maior peso</option></select></label></div>
    {expanded && <div id="dex-advanced" className="dex-advanced"><div><div className="filter-label"><b>Tipos Pokémon</b><span>Combine até dois tipos</span></div><div className="filter-type-grid">{Object.values(POKEMON_TYPES).map(type => <button key={type.name} style={typeStyle(type.name)} onClick={() => toggleType(type.name)} aria-pressed={filters.selectedTypes.includes(type.name)} className={filters.selectedTypes.includes(type.name) ? 'is-selected' : ''}><span>{type.icon}</span>{type.name}{filters.selectedTypes.includes(type.name) && <b>✓</b>}</button>)}</div></div><div className="filter-evolution"><label htmlFor="evolution-status">Evolução</label><select id="evolution-status" value={filters.evolutionStatus} onChange={e => onChange({ ...filters, evolutionStatus: e.target.value as PokedexFilters['evolutionStatus'] })}><option value="ALL">Todas as espécies</option><option value="HAS_EVOLUTION">Pode evoluir</option><option value="NO_EVOLUTION">Não evolui</option></select><span>{totalResults} resultados</span><button onClick={onReset}>Limpar filtros ↺</button></div></div>}
    {!expanded && count > 0 && <div className="filter-summary"><span>{filters.selectedTypes.join(' + ') || 'Filtros personalizados'} · {totalResults} resultados</span><button onClick={onReset}>Limpar filtros</button></div>}
  </section>;
}
