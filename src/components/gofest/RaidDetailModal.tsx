"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { GoFestPokemon } from "@/lib/goFest2026";
import { calculateDefenseMultipliers, POKEMON_TYPES } from "@/lib/typeEffectiveness";

export default function RaidDetailModal({ pokemon, onClose }: { pokemon: GoFestPokemon | null; onClose: () => void }) {
  if (!pokemon) return null;
  const artworkId = pokemon.pokeApiId || pokemon.fallbackPokeApiId;
  const results = pokemon.types?.length ? calculateDefenseMultipliers(pokemon.types) : null;
  const strongest = results ? [...results.doubleWeakness, ...results.weakness] : [];
  const renderTypes = (types: string[], multiplier: string) => types.map((type) => {
    const info = POKEMON_TYPES[type];
    return <span key={type} className={`rounded-xl px-2.5 py-1 text-xs font-button font-black ${info.colorBg} ${info.colorText}`}>{info.icon} {type} <small>· {multiplier}</small></span>;
  });
  return <AnimatePresence>
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
      <button className="absolute inset-0" onClick={onClose} aria-label="Fechar detalhes" />
      <motion.section initial={{ opacity: 0, scale: .94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .94, y: 16 }} className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-[#D9D9D9] bg-white shadow-2xl font-navbar">
        <header className="bg-gradient-to-r from-[#1B4F9C] to-[#2A75BB] p-5 text-center text-white">
          <button onClick={onClose} className="absolute right-3 top-3 rounded-full bg-black/20 px-2.5 py-1 text-sm font-black">✕</button>
          {artworkId ? <div className="relative mx-auto h-28 w-28"><Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${artworkId}.png`} alt={pokemon.name} fill sizes="112px" className="object-contain drop-shadow-lg" unoptimized /></div> : <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-3xl">?</div>}
          <p className="mt-1 text-[10px] font-stats font-black tracking-widest text-[#FFCB05]">CHEFE DE REIDE</p><h2 className="font-heading text-2xl font-black">{pokemon.name}</h2>
        </header>
        <div className="space-y-4 p-5">
          {pokemon.types?.length ? <><div><p className="mb-1.5 text-xs font-button font-black text-[#1B4F9C]">TIPOS</p><div className="flex flex-wrap gap-1.5">{pokemon.types.map((type) => { const info = POKEMON_TYPES[type]; return <span key={type} className={`rounded-lg px-2 py-1 text-xs font-button font-black ${info.colorBg} ${info.colorText}`}>{info.icon} {type}</span>; })}</div></div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3"><p className="text-sm font-heading font-black text-[#EE1515]">⚔️ Melhores tipos contra este chefe</p>{strongest.length ? <><p className="mt-1 text-xs text-[#1E1E1E]/65">Prioridade para fraquezas duplas.</p><div className="mt-2 flex flex-wrap gap-1.5">{renderTypes(results!.doubleWeakness, "2,56×")} {renderTypes(results!.weakness, "1,6×")}</div></> : <p className="mt-1 text-xs">Sem fraquezas especiais encontradas.</p>}</div>
          </> : <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-center"><p className="font-button text-sm font-black text-amber-800">Dados da forma ainda não disponíveis</p><p className="mt-1 text-xs text-amber-900/70">Ainda não há informações de tipos disponíveis para esta forma.</p></div>}
          <p className="text-[10px] text-[#1E1E1E]/50">Multiplicadores exibidos no padrão Pokémon GO.</p>
        </div>
      </motion.section>
    </div>
  </AnimatePresence>;
}
