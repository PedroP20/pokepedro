"use client";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { fetchPokemonMasterList } from '@/queries/pokeApi';
import { POKEMON_TYPES, ATTACK_EFFECTIVENESS, calculateDefenseMultipliers } from '@/lib/typeEffectiveness';
import ClubIcon from '@/components/ui/ClubIcon';
import TypeBadge, { typeStyle } from '@/components/ui/TypeBadge';
const TypeGuide = dynamic(() => import('@/components/academy/TypeGuide'));
type Mode = 'DEFENSE' | 'ATTACK' | 'GUIDE';
function ResultCard({ title, description, multiplier, types, tone, empty }: { title: string; description: string; multiplier: string; types: string[]; tone: string; empty?: string }) {
  return <article className={`combat-result ${tone}`}><div className="combat-result-top"><span>{tone === 'danger' ? <ClubIcon name="battle"/> : <ClubIcon name="shield"/>}</span><strong>{multiplier}<small>DANO</small></strong></div><h3>{title}</h3><p>{description}</p><div className="combat-result-types">{types.length ? types.map(type => <TypeBadge key={type} type={type}/>) : <span className="result-empty">{empty || 'Nenhum tipo nesta categoria.'}</span>}</div></article>;
}
export default function AcademyPage() {
  const [mode, setMode] = useState<Mode>('DEFENSE');
  const [attack, setAttack] = useState('Fogo');
  const [manualTypes, setManualTypes] = useState<string[]>(['Planta', 'Venenoso']);
  const [search, setSearch] = useState('');
  const [pokemonId, setPokemonId] = useState<number | null>(null);
  const { data: catalog = [], isPending, isError, refetch } = useQuery({ queryKey: ['pokemonMasterList'], queryFn: fetchPokemonMasterList, staleTime: Infinity });
  const selected = catalog.find(p => p.id === pokemonId);
  const types = selected?.types || manualTypes;
  const term = search.trim().toLowerCase().replace(/^#0*/, '');
  const suggestions = term ? catalog.filter(p => p.name.toLowerCase().includes(term) || String(p.id) === term).slice(0, 6) : [];
  const results = calculateDefenseMultipliers(types);
  const rules = ATTACK_EFFECTIVENESS[attack];
  const toggle = (type: string) => {
    setPokemonId(null); setSearch('');
    setManualTypes(types.includes(type) ? types.filter(t => t !== type) : [...types.slice(0, 1), type]);
  };
  return <main id="main-content" className="club-page combat-page">
    <header className="page-intro"><div><span className="eyebrow"><ClubIcon name="battle" size={16}/> LABORATÓRIO DE ESTRATÉGIA</span><h1>Jogue com<br className="sm:hidden"/> vantagem<span>.</span></h1><p>Conheça os tipos. Entenda os confrontos. Entre no combate preparado.</p></div><Link href="/play" className="club-button light"><ClubIcon name="play" size={18}/> Treinar tipos</Link></header>
    <div className="combat-mode-tabs" role="group" aria-label="Modo de análise">{([['DEFENSE','shield','Defesa','Conheça suas fraquezas'],['ATTACK','battle','Ataque','Encontre suas vantagens'],['GUIDE','book','Guia de tipos','Aprenda as combinações']] as const).map(([id, icon, title, caption]) => <button key={id} onClick={() => setMode(id)} aria-pressed={mode === id} className={mode === id ? 'is-active' : ''}><ClubIcon name={icon} size={23}/><span><b>{title}</b><small>{caption}</small></span></button>)}</div>
    {mode === 'GUIDE' ? <TypeGuide/> : <div className="combat-workspace" key={mode}>
      <section className="combat-controls"><div className="panel-heading"><span className="step-number">01</span><div><h2>{mode === 'DEFENSE' ? 'Seu Pokémon, sua estratégia.' : 'Escolha seu ataque.'}</h2><p>{mode === 'DEFENSE' ? 'Busque uma espécie ou combine até dois tipos.' : 'Veja contra quais tipos seu ataque funciona melhor.'}</p></div></div>
        {mode === 'DEFENSE' && <div className="combat-search-area"><label className="dex-search"><ClubIcon name="search" size={20}/><input type="search" value={search} aria-label="Pesquisar Pokémon no Combate" placeholder="Nome ou número do Pokémon" onChange={e => { setSearch(e.target.value); setPokemonId(null); }}/></label>{term && !selected && <div className="combat-suggestions">{isPending ? <p role="status">Preparando catálogo…</p> : isError ? <div role="alert"><p>Não foi possível carregar a busca.</p><button onClick={() => void refetch()}>Tentar novamente</button></div> : suggestions.length ? suggestions.map(p => <button key={p.id} onClick={() => { setPokemonId(p.id); setSearch(p.name); }}><Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt="" width={40} height={40} unoptimized/><b>{p.name}</b><span>#{String(p.id).padStart(4, '0')}</span></button>) : <p>Nenhum Pokémon encontrado.</p>}</div>}</div>}
        <div className="combat-current">{selected ? <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selected.id}.png`} alt={selected.name} width={70} height={70} unoptimized/> : <span className="combat-current-icon"><ClubIcon name={mode === 'DEFENSE' ? 'shield' : 'battle'} size={28}/></span>}<div><small>{selected ? 'POKÉMON SELECIONADO' : mode === 'DEFENSE' ? 'TIPAGEM PERSONALIZADA' : 'TIPO DO ATAQUE'}</small><h3>{selected?.name || (mode === 'DEFENSE' ? types.join(' + ') || 'Selecione um tipo' : attack)}</h3></div>{mode === 'DEFENSE' && <button aria-label="Limpar Pokémon e tipos" className="combat-clear" onClick={() => { setPokemonId(null); setSearch(''); setManualTypes([]); }}>↺</button>}</div>
        <div className="combat-type-grid">{Object.values(POKEMON_TYPES).map(type => <button key={type.name} style={typeStyle(type.name)} onClick={() => mode === 'DEFENSE' ? toggle(type.name) : setAttack(type.name)} aria-pressed={mode === 'DEFENSE' ? types.includes(type.name) : attack === type.name} className={(mode === 'DEFENSE' ? types.includes(type.name) : attack === type.name) ? 'is-selected' : ''}><span className="type-selector-icon">{type.icon}</span><span>{type.name}</span><b>✓</b></button>)}</div>
        <p className="combat-controls-note"><ClubIcon name="book" size={16}/> A análise considera a tipagem; habilidades e movimentos podem alterar o resultado.</p>
      </section>
      <section className="combat-analysis" aria-live="polite"><div className="panel-heading"><span className="step-number">02</span><div><h2>Leitura do confronto</h2><p>Multiplicadores dos jogos principais da série.</p></div></div>
        {mode === 'DEFENSE' && !types.length ? <div className="club-empty"><ClubIcon name="shield" size={40}/><h3>Monte sua combinação.</h3><p>Selecione um ou dois tipos para revelar o confronto.</p></div> : <div className="combat-results">{mode === 'DEFENSE' ? <>
          <ResultCard title="Atenção às fraquezas" description="Estes ataques causam dano aumentado." multiplier="2×" types={results.weakness} tone="danger" empty="Esta tipagem não tem fraquezas simples."/>
          {results.doubleWeakness.length > 0 && <ResultCard title="Fraqueza dupla" description="Os dois tipos são vulneráveis a estes ataques." multiplier="4×" types={results.doubleWeakness} tone="danger"/>}
          <ResultCard title="Sua zona de proteção" description="Estes ataques causam menos dano." multiplier="½×" types={results.resistance} tone="safe"/>
          {results.doubleResistance.length > 0 && <ResultCard title="Resistência dupla" description="Os dois tipos reduzem o dano recebido." multiplier="¼×" types={results.doubleResistance} tone="safe"/>}
          {results.immune.length > 0 && <ResultCard title="Imunidade de tipo" description="Estes ataques não causam dano." multiplier="0×" types={results.immune} tone="neutral"/>}
        </> : <><ResultCard title="Super efetivo" description="Aposte neste ataque contra estes tipos." multiplier="2×" types={rules.superEffective} tone="safe"/><ResultCard title="Pouco efetivo" description="Estes tipos resistem ao seu ataque." multiplier="½×" types={rules.notVeryEffective} tone="danger"/><ResultCard title="Sem efeito" description="Estes tipos são imunes ao seu ataque." multiplier="0×" types={rules.noEffect} tone="neutral"/></>}</div>}
        <aside className="combat-tip"><ClubIcon name="spark"/><div><b>Vai jogar Pokémon GO?</b><p>No GO, as vantagens usam 1,6× e as resistências 0,625×. Imunidades também viram resistência.</p></div></aside>
      </section>
    </div>}
  </main>;
}
