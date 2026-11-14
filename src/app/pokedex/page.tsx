"use client";
import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { fetchPokemonMasterList } from '@/queries/pokeApi';
import { filterCatalog } from '@/lib/catalogFilters';
import type { PokedexFilters, PokemonCatalogEntry, Region } from '@/types/pokemon';
import PokedexFilterBar from '@/components/pokedex/PokedexFilterBar';
import TypeBadge, { typeStyle } from '@/components/ui/TypeBadge';
import ClubIcon from '@/components/ui/ClubIcon';
const PokedexDetailModal = dynamic(() => import('@/components/pokedex/PokedexDetailModal'), { ssr: false });
const defaults: PokedexFilters = { searchTerm: '', region: 'ALL', selectedTypes: [], sortBy: 'ID', evolutionStatus: 'ALL' };
const regions: { id: Region; label: string }[] = [{ id: 'ALL', label: 'Todas' }, ...['KANTO','JOHTO','HOENN','SINNOH','UNOVA','KALOS','ALOLA','GALAR','HISUI','PALDEA'].map(id => ({ id: id as Region, label: id.charAt(0) + id.slice(1).toLowerCase() }))];
function PokemonCard({ pokemon, onSelect, eager }: { pokemon: PokemonCatalogEntry; onSelect: () => void; eager: boolean }) {
  const [failed, setFailed] = useState(false);
  return <button className="dex-card" style={typeStyle(pokemon.types[0])} onClick={onSelect} aria-label={`Ver ${pokemon.name}, número ${pokemon.id}`}>
    <div className="dex-card-top"><span>#{String(pokemon.id).padStart(4, '0')}</span><span className="dex-card-plus">↗</span></div>
    <div className="dex-card-stage"><span className="dex-card-orbit"/>{failed ? <span className="dex-art-fallback"><ClubIcon name="dex" size={48}/></span> : <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`} alt={pokemon.name} fill sizes="(max-width: 600px) 140px, 180px" className="dex-card-art" unoptimized loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(true)}/>}</div>
    <div className="dex-card-info"><h3>{pokemon.name}</h3><div>{pokemon.types.map(type => <TypeBadge key={type} type={type}/>)}</div></div>
  </button>;
}
export default function PokedexPage() {
  const [filters, setFilters] = useState<PokedexFilters>(defaults);
  const [selected, setSelected] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const deferredFilters = useDeferredValue(filters);
  const { data: catalog = [], isPending, isError, refetch } = useQuery({ queryKey: ['pokemonMasterList'], queryFn: fetchPokemonMasterList, staleTime: Infinity });
  const list = filterCatalog(catalog, deferredFilters);
  const perPage = 48;
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const change = (value: PokedexFilters) => { setFilters(value); setPage(1); };
  return <main id="main-content" className="club-page dex-page">
    <header className="page-intro"><div><span className="eyebrow"><ClubIcon name="dex" size={16}/> ARQUIVO POKÉMON</span><h1>Descobertas<br className="sm:hidden"/> sem limites<span>.</span></h1><p>De Bulbasaur a Pecharunt. Encontre seu favorito e conheça cada detalhe.</p></div><div className="intro-stat"><strong>1.025</strong><span>ESPÉCIES · 9 GERAÇÕES</span></div></header>
    <nav className="region-tabs" aria-label="Regiões da Pokédex">{regions.map(region => <button key={region.id} onClick={() => change({ ...filters, region: region.id })} aria-pressed={filters.region === region.id} className={filters.region === region.id ? 'is-active' : ''}>{region.label}</button>)}</nav>
    <PokedexFilterBar filters={filters} onChange={change} onReset={() => change(defaults)} totalResults={list.length}/>
    <div className="dex-results-heading"><span><b>{list.length}</b> Pokémon encontrados</span><span>Toque em um card para explorar <ClubIcon name="arrow" size={16}/></span></div>
    {isError ? <section className="club-empty" role="alert"><ClubIcon name="dex" size={40}/><h2>O catálogo não carregou.</h2><p>Tente novamente para continuar explorando.</p><button className="club-button blue" onClick={() => void refetch()}>Tentar novamente</button></section> : isPending ? <div className="dex-grid" aria-label="Carregando Pokédex" aria-busy="true">{Array.from({ length: 12 }, (_, i) => <div key={i} className="dex-skeleton"/>)}</div> : list.length === 0 ? <section className="club-empty"><ClubIcon name="search" size={40}/><h2>Nenhum Pokémon por aqui.</h2><p>Experimente outro nome, região ou combinação de tipos.</p><button className="club-button red" onClick={() => change(defaults)}>Limpar filtros</button></section> : <><section className="dex-grid" aria-label="Pokémon encontrados" aria-busy={deferredFilters !== filters}>{list.slice((page - 1) * perPage, page * perPage).map((pokemon, index) => <PokemonCard key={pokemon.id} pokemon={pokemon} eager={index < 10} onSelect={() => setSelected(pokemon.id)}/>)}</section><nav className="dex-pagination" aria-label="Páginas da Pokédex"><button disabled={page === 1} onClick={() => { setPage(v => v - 1); document.querySelector('.pokedex-filters')?.scrollIntoView({ block: 'start' }); }}>← Anterior</button><span>Página <b>{page}</b> de {pages}</span><button disabled={page >= pages} onClick={() => { setPage(v => v + 1); document.querySelector('.pokedex-filters')?.scrollIntoView({ block: 'start' }); }}>Próxima →</button></nav></>}
    {selected !== null && <PokedexDetailModal key={selected} pokemonId={selected} onClose={() => setSelected(null)} onNavigate={setSelected} minId={1} maxId={1025}/>}
  </main>;
}
