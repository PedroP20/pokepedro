"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GoFestPokemon } from "@/lib/goFest2026";

interface Props {
  pokemon: GoFestPokemon;
  captured: boolean;
  isRaid?: boolean;
  raidLabel?: string;
  onToggle: () => void;
  onOpen?: () => void;
}

export default function GoFestPokemonCard({ pokemon, captured, isRaid = false, raidLabel = "REIDE", onToggle, onOpen }: Props) {
  const artworkId = pokemon.pokeApiId || pokemon.fallbackPokeApiId;
  const unavailableArt = !artworkId;
  return (
    <motion.article layout className={`relative overflow-hidden rounded-2xl border-2 bg-white p-2.5 shadow-sm transition ${captured ? "border-emerald-500 bg-emerald-50/40" : isRaid ? "border-[#FFCB05]" : "border-[#D9D9D9]"}`}>
      <button
        onClick={isRaid ? onOpen : onToggle}
        className="group flex w-full flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4F9C] rounded-xl"
        aria-label={isRaid ? `Ver detalhes de ${pokemon.name}` : `${captured ? "Desmarcar" : "Marcar"} ${pokemon.name} como capturado`}
      >
        <span className={`absolute left-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-stats font-black ${isRaid ? "bg-[#1B4F9C] text-white" : "bg-[#F5F5F5] text-[#1E1E1E]/60"}`}>{isRaid ? raidLabel : "NATUREZA"}</span>
        <div className="relative mt-2 h-16 w-16 sm:h-20 sm:w-20">
          {artworkId ? <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${artworkId}.png`} alt={pokemon.name} fill sizes="80px" className="object-contain drop-shadow-sm transition group-hover:scale-110" unoptimized /> : <span className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-2xl" title="Forma ainda não disponível na fonte de imagens">?</span>}
        </div>
        <span className="mt-1 min-h-8 text-[11px] font-button font-black leading-tight text-[#1E1E1E]">{pokemon.name}</span>
        {unavailableArt && <span className="mt-0.5 text-[8px] font-stats font-bold text-amber-700">Arte oficial indisponível</span>}
      </button>
      <button onClick={onToggle} aria-label={`${captured ? "Desmarcar" : "Marcar"} ${pokemon.name} como capturado`} className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4F9C] ${captured ? "border-emerald-600 bg-emerald-600 text-white" : "border-[#D9D9D9] bg-white text-[#1E1E1E]/45 hover:border-emerald-500"}`}>
        {captured ? "✓" : "+"}
      </button>
      {captured && <span className="mt-1 block text-center text-[9px] font-button font-black text-emerald-700">CAPTURADO ✓</span>}
    </motion.article>
  );
}
