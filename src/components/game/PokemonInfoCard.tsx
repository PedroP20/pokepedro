"use client";

import { useState } from "react";
import type { PokemonDetails } from "@/types/pokemon";
import EvolutionModal from "./EvolutionModal";
import GameGlyph from "./GameGlyph";
import TypeBadge from "@/components/ui/TypeBadge";

interface PokemonInfoCardProps { details: PokemonDetails; onNext: () => void; isCorrect: boolean; learning?: boolean; nextLabel?: string }
export default function PokemonInfoCard({ details, onNext, isCorrect, learning = false, nextLabel = "Próximo Pokémon" }: PokemonInfoCardProps) {
  const [evolutionOpen, setEvolutionOpen] = useState(false);
  return <>
    <div className="arena-info-card">
      <div className={`arena-feedback ${learning ? "is-learning" : isCorrect ? "is-correct" : "is-wrong"}`} role="status"><span>{learning ? <GameGlyph name="learn" /> : isCorrect ? <GameGlyph name="check" /> : "!"}</span><div><strong>{learning ? "Uma nova descoberta." : isCorrect ? "Resposta certa. Boa, treinador!" : "Agora você já sabe."}</strong><small>{learning ? "Memorize o nome e observe os detalhes." : isCorrect ? "Continue construindo sua sequência." : "Cada descoberta conta para sua evolução."}</small></div></div>
      <div className="arena-info-meta"><span>#{String(details.id).padStart(4,"0")}</span><span>{details.region} · {details.generation}</span></div>
      <h2>{details.name}</h2><div className="arena-type-badges">{details.types.map(type => <TypeBadge key={type} type={type} />)}</div>
      {details.flavorText && <p className="arena-flavor">{details.flavorText}</p>}
      <dl className="arena-pokemon-stats"><div><dt>ALTURA</dt><dd>{details.height}<small> m</small></dd></div><div><dt>PESO</dt><dd>{details.weight}<small> kg</small></dd></div></dl>
      {details.evolutions?.length > 1 && <button className="arena-evolution-button" onClick={() => setEvolutionOpen(true)}><GameGlyph name="learn" />Explorar evolução <span>{details.evolutions.length} estágios</span><GameGlyph name="arrow" /></button>}
      <button className="arena-primary" onClick={onNext}>{nextLabel}<GameGlyph name="arrow" /></button>
    </div>
    <EvolutionModal isOpen={evolutionOpen} onClose={() => setEvolutionOpen(false)} evolutions={details.evolutions} evolutionTree={details.evolutionTree} currentId={details.id} />
  </>;
}
