"use client";
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { fetchPokemonDetails, fetchPokemonFormData } from '@/queries/pokeApi';
import ClubIcon from '@/components/ui/ClubIcon';
import TypeBadge, { typeStyle } from '@/components/ui/TypeBadge';
const Pokemon3DViewer = dynamic(() => import('@/components/pokedex/Pokemon3DViewer'), { ssr: false });
const EvolutionModal = dynamic(() => import('@/components/game/EvolutionModal'), { ssr: false });
interface Props { pokemonId: number | null; onClose: () => void; onNavigate: (id: number) => void; minId: number; maxId: number; }
export default function PokedexDetailModal({ pokemonId, onClose, onNavigate, minId, maxId }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [formId, setFormId] = useState<number | null>(null);
  const [shiny, setShiny] = useState(false);
  const [view3D, setView3D] = useState(false);
  const [evolutions, setEvolutions] = useState(false);
  const [artFailed, setArtFailed] = useState(false);
  const [female, setFemale] = useState(false);
  const { data: details, isPending, isError, refetch } = useQuery({ queryKey: ['pokemonDetails', pokemonId], queryFn: () => fetchPokemonDetails(pokemonId!), enabled: pokemonId !== null });
  const { data: form, isFetching: loadingForm, isError: formError } = useQuery({ queryKey: ['pokemonForm', formId], queryFn: () => fetchPokemonFormData(formId!), enabled: formId !== null });
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    if (pokemonId !== null) dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, [pokemonId]);
  const active = formId && form ? form : details;
  const hasShiny = female ? Boolean(details?.femaleShinySpriteUrl) : Boolean(active?.hasShinyArtwork);
  const isShiny = shiny && hasShiny;
  const activeId = active?.id || pokemonId;
  const art = female ? (isShiny ? details?.femaleShinySpriteUrl : details?.femaleSpriteUrl) || '' : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? 'shiny/' : ''}${activeId}.png`;
  const navigate = (id: number) => { setFormId(null); setFemale(false); setShiny(false); setView3D(false); setArtFailed(false); onNavigate(id); };
  const baseId = details?.speciesId || pokemonId || 1;
  if (pokemonId === null) return null;
  return <dialog ref={dialog} className="dex-detail-dialog" aria-labelledby="pokemon-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="dex-detail-inner">
      <div className="dex-detail-toolbar"><span className="eyebrow"><ClubIcon name="dex" size={16}/> POKÉDEX · FICHA DA ESPÉCIE</span><button autoFocus className="club-icon-button" onClick={onClose} aria-label="Fechar detalhes do Pokémon">✕</button></div>
      {isError ? <div className="club-empty" role="alert"><h2>Este Pokémon não carregou.</h2><p>A conexão com a PokéAPI falhou. Tente novamente.</p><button className="club-button blue" onClick={() => void refetch()}>Tentar novamente</button></div> : isPending || !details || !active ? <div className="profile-skeleton" role="status">Preparando a ficha do Pokémon…</div> :
      <><div className="dex-detail-layout"><div className="dex-detail-stage" style={typeStyle(active.types[0])}><span className="dex-detail-region">{details.region} · {details.generation}</span><div className={`dex-detail-art${view3D ? ' is-3d' : ''}`}>{view3D ? <Pokemon3DViewer pokemonId={active.id} name={active.name} baseName={details.name} formSlug={details.varieties.find(v => v.id === formId)?.slug || details.name.toLowerCase()} isShiny={isShiny} gradient="from-slate-700 to-slate-900"/> : loadingForm ? <p role="status">Carregando forma…</p> : artFailed ? <span className="dex-art-fallback"><ClubIcon name="dex" size={70}/></span> : <Image key={art} src={art} alt={active.name} fill sizes="(max-width: 650px) 250px, 320px" className="object-contain p-6" unoptimized onError={() => setArtFailed(true)}/>}</div><div className="dex-detail-art-actions"><button onClick={() => { setShiny(v => !v); setArtFailed(false); }} disabled={!hasShiny} aria-pressed={isShiny}>✦ Shiny</button><button disabled={female} onClick={() => setView3D(v => !v)} aria-pressed={view3D}><ClubIcon name="dex" size={14}/> {view3D ? 'Ver arte' : 'Modelo 3D'}</button>{!formId && details.femaleSpriteUrl && <button onClick={() => { setFemale(v => !v); setView3D(false); setArtFailed(false); }} aria-pressed={female}>{female ? '♀ Fêmea' : '♂ Macho'}</button>}</div></div>
        <div className="dex-detail-copy"><span className="dex-detail-number">#{String(active.id).padStart(4, '0')}</span><h2 id="pokemon-title">{active.name}{isShiny ? ' ✦' : ''}</h2><div className="dex-detail-types">{active.types.map(type => <TypeBadge key={type} type={type}/>)}</div><p className="dex-flavor">{details.flavorText}</p><div className="dex-physical"><div><span>ALTURA</span><strong>{active.height.toLocaleString('pt-BR')} <small>m</small></strong></div><div><span>PESO</span><strong>{active.weight.toLocaleString('pt-BR')} <small>kg</small></strong></div><div><span>CLASSIFICAÇÃO</span><strong className="dex-classification">{details.isMythic ? 'Mítico' : details.isLegendary ? 'Lendário' : 'Espécie comum'}</strong></div></div>
        <div className="dex-detail-evolution"><ClubIcon name="spark"/><div><b>{details.canEvolve ? 'Ainda pode evoluir' : 'Uma forma completa'}</b><small>{details.evolutions.length > 1 ? 'Conheça sua família evolutiva.' : 'Esta espécie não possui uma cadeia de evolução.'}</small></div><button onClick={() => setEvolutions(true)} disabled={details.evolutions.length < 2}>Ver evolução →</button></div></div></div>
        {details.varieties.length > 1 && <section className="dex-forms"><h3>Novas formas. Novas possibilidades.</h3><p>Selecione uma forma para consultar sua tipagem, altura e peso.</p><div><button aria-pressed={formId === null} onClick={() => { setFormId(null); setView3D(false); setArtFailed(false); }}>Forma padrão</button>{details.varieties.filter(v => v.id !== details.id).map(v => <button key={v.id} aria-pressed={formId === v.id} onClick={() => { setFormId(v.id); setFemale(false); setView3D(false); setArtFailed(false); }}>{v.name}</button>)}</div>{formError && <p role="alert">Esta forma não carregou. Selecione outra para continuar.</p>}</section>}
        <div className="dex-detail-pagination"><button disabled={baseId <= minId} onClick={() => navigate(baseId - 1)}>← Anterior</button><span>Continue explorando</span><button disabled={baseId >= maxId} onClick={() => navigate(baseId + 1)}>Próximo →</button></div>
        {evolutions && <EvolutionModal evolutions={details.evolutions} evolutionTree={details.evolutionTree} currentId={baseId} isOpen={evolutions} onClose={() => setEvolutions(false)} onNavigate={id => { setEvolutions(false); navigate(id); }}/>}
      </>}
    </div>
  </dialog>;
}
