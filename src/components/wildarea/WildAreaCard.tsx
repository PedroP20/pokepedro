"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import TypeBadge from "@/components/ui/TypeBadge";
import { artworkUrl, WildAreaPokemon } from "@/lib/wildArea2026";

interface Props {
  pokemon: WildAreaPokemon;
  captured: boolean;
  shiny: boolean;
  badge?: string;
  specialBackground?: boolean;
  onToggle: () => void;
  onToggleShiny: () => void;
  onStrategy?: () => void;
}

export default function WildAreaCard({ pokemon, captured, shiny, badge, specialBackground, onToggle, onToggleShiny, onStrategy }: Props) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: .94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: .94 }}
      transition={{ duration: .2 }}
      className={`wa-card ${captured ? "is-captured" : ""} ${shiny ? "is-shiny" : ""}`}
    >
      <button type="button" className="wa-card-main" onClick={onToggle} aria-pressed={captured} aria-label={`${captured ? "Desmarcar" : "Marcar"} ${pokemon.name}${pokemon.tag ? ` (${pokemon.tag})` : ""} como capturado`}>
        <span className="wa-card-stage">
          <Image src={artworkUrl(pokemon, shiny)} alt="" fill sizes="(max-width: 650px) 90px, 110px" className="wa-card-art" unoptimized />
          {shiny && <span className="wa-card-sparkle" aria-hidden="true">✨</span>}
        </span>
        <span className="wa-card-name">{pokemon.name}</span>
        {pokemon.tag && <span className="wa-card-tag">{pokemon.tag}</span>}
        <span className="wa-card-types">{pokemon.types.map(type => <TypeBadge key={type} type={type} />)}</span>
        <span className="wa-card-check" aria-hidden="true">{captured ? "✓ Capturado" : "Toque para marcar"}</span>
      </button>
      <div className="wa-card-top">
        {badge && <span className="wa-card-badge">{badge}</span>}
        {specialBackground && <span className="wa-card-badge is-bg" title="Pode vir com o novo Fundo Especial">🖼️</span>}
        <button type="button" className={`wa-shiny-toggle ${shiny ? "is-on" : ""}`} onClick={onToggleShiny} aria-pressed={shiny} aria-label={`${shiny ? "Desmarcar" : "Marcar"} ${pokemon.name} como brilhante`} title="Peguei brilhante">✨</button>
      </div>
      {onStrategy && <button type="button" className="wa-card-strategy" onClick={onStrategy} aria-label={`Ver melhores tipos contra ${pokemon.name}`}>⚔️ Estratégia</button>}
    </motion.article>
  );
}
