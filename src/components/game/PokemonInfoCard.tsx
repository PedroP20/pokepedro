"use client";

import { useState } from "react";
import { PokemonDetails } from "@/types/pokemon";
import { motion } from "framer-motion";
import EvolutionModal from "@/components/game/EvolutionModal";

interface PokemonInfoCardProps {
  details: PokemonDetails;
  onNext: () => void;
  isCorrect: boolean;
}

// ⚠️ AS CORES DOS TIPOS PERMANECEM INTACTAS COMO VOCÊ PEDIU!
const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-neutral-500 text-white",
  Fogo: "bg-red-600 text-white",
  Água: "bg-blue-600 text-white",
  Planta: "bg-green-600 text-white",
  Elétrico: "bg-yellow-500 text-black",
  Gelo: "bg-cyan-400 text-black",
  Lutador: "bg-orange-700 text-white",
  Venenoso: "bg-purple-600 text-white",
  Terrestre: "bg-amber-700 text-white",
  Voador: "bg-indigo-400 text-white",
  Psíquico: "bg-pink-600 text-white",
  Inseto: "bg-lime-600 text-white",
  Pedra: "bg-stone-600 text-white",
  Fantasma: "bg-purple-900 text-white",
  Dragão: "bg-violet-700 text-white",
  Aço: "bg-slate-500 text-white",
  Fada: "bg-pink-400 text-black",
};

export default function PokemonInfoCard({ details, onNext, isCorrect }: PokemonInfoCardProps) {
  const [isEvoModalOpen, setIsEvoModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95, x: isCorrect ? 0 : [-10, 10, -8, 8, 0] }}
        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-[#FFFFFF] border border-[#D9D9D9] rounded-2xl p-6 shadow-xl flex flex-col items-center text-center space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar font-card"
      >
        {/* Banner de Acerto ou Erro */}
        <div
          className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-sm md:text-base tracking-wide uppercase shadow-sm flex items-center justify-center gap-2 ${
            isCorrect
              ? "bg-[#2A75BB] text-[#FFFFFF] animate-bounce"
              : "bg-[#EE1515] text-[#FFFFFF]"
          }`}
        >
          <span>{isCorrect ? "🎉 Você Acertou em Cheio!" : "❌ Que pena, você errou!"}</span>
        </div>

        {/* Cabeçalho */}
        <div className="flex justify-between items-center w-full text-xs font-bold text-[#1E1E1E]/60 uppercase tracking-wider pt-1">
          <span className="font-stats font-bold text-sm">#{String(details.id).padStart(4, "0")}</span>
          <span className="text-[#1B4F9C] font-bold bg-[#F5F5F5] px-3 py-1 rounded-full border border-[#D9D9D9] shadow-sm">
            📍 Região: {details.region}
          </span>
          <span>{details.generation}</span>
        </div>

        {/* Nome e Tipagens */}
        <div>
          <h2 className="text-3xl font-black text-[#1E1E1E] tracking-tight">
            {details.name}
          </h2>
          <div className="flex gap-2 justify-center mt-2">
            {details.types.map((type) => (
              <span
                key={type}
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase shadow-sm ${
                  TYPE_COLORS[type] || "bg-gray-500 text-white"
                }`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Curiosidade da Pokédex */}
        <p className="text-xs md:text-sm text-[#1E1E1E]/80 italic bg-[#F5F5F5] p-3 rounded-xl border border-[#D9D9D9] font-body">
          &quot;{details.flavorText}&quot;
        </p>

        {/* Grid de Estatísticas */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-[#F5F5F5] p-2 rounded-xl border border-[#D9D9D9] text-center">
            <span className="text-xs text-[#1E1E1E]/60 font-bold block">Altura</span>
            <span className="text-base font-black text-[#1E1E1E]">{details.height} m</span>
          </div>
          <div className="bg-[#F5F5F5] p-2 rounded-xl border border-[#D9D9D9] text-center">
            <span className="text-xs text-[#1E1E1E]/60 font-bold block">Peso</span>
            <span className="text-base font-black text-[#1E1E1E]">{details.weight} kg</span>
          </div>
        </div>

        {/* Botão para Ver Cadeia Evolutiva */}
        {details.evolutions && details.evolutions.length > 1 && (
          <button
            onClick={() => setIsEvoModalOpen(true)}
            className="w-full py-2.5 px-4 bg-[#F5F5F5] hover:bg-[#FFFFFF] border border-[#D9D9D9] hover:border-[#2A75BB] rounded-xl font-extrabold text-sm text-[#1B4F9C] transition duration-200 flex items-center justify-center gap-2 shadow-sm group shrink-0"
          >
            <span className="text-base">🧬</span>
            <span>Ver Cadeia Evolutiva ({details.evolutions.length} estágios)</span>
            <span className="text-xs text-[#1B4F9C]/60 group-hover:translate-x-0.5 transition-transform">↗</span>
          </button>
        )}

        {/* Botão Próximo */}
        <button
          onClick={onNext}
          className="w-full mt-1 py-3 bg-[#EE1515] hover:bg-[#cc1010] active:bg-[#aa0d0d] text-[#FFFFFF] font-black rounded-xl transition duration-200 shadow-lg shadow-[#EE1515]/20 flex items-center justify-center gap-2 group shrink-0"
        >
          <span>Próximo Pokémon</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </motion.div>

      {/* Modal de Evolução */}
      <EvolutionModal
        isOpen={isEvoModalOpen}
        onClose={() => setIsEvoModalOpen(false)}
        evolutions={details.evolutions}
        currentId={details.id}
      />
    </>
  );
}