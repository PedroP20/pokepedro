"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPokemonDetails } from "@/queries/pokeApi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import EvolutionModal from "@/components/game/EvolutionModal";
import { PokemonVariety } from "@/types/pokemon";

interface PokedexDetailModalProps {
  pokemonId: number | null;
  onClose: () => void;
  onNavigate: (newId: number) => void;
  minId: number;
  maxId: number;
}

const TYPE_GRADIENTS: Record<string, string> = {
  Normal: "from-neutral-500 to-slate-700", Fogo: "from-orange-400 via-red-500 to-red-700",
  Água: "from-blue-400 via-cyan-500 to-blue-700", Planta: "from-green-400 via-emerald-500 to-green-700",
  Elétrico: "from-yellow-300 via-amber-400 to-yellow-600", Gelo: "from-cyan-300 via-blue-400 to-blue-600",
  Lutador: "from-orange-600 via-red-700 to-red-900", Venenoso: "from-purple-400 via-fuchsia-600 to-purple-800",
  Terrestre: "from-amber-500 via-yellow-600 to-amber-800", Voador: "from-indigo-300 via-blue-500 to-indigo-700",
  Psíquico: "from-pink-400 via-rose-500 to-pink-700", Inseto: "from-lime-400 via-green-600 to-green-800",
  Pedra: "from-stone-400 via-amber-700 to-stone-800", Fantasma: "from-purple-700 via-indigo-900 to-slate-900",
  Dragão: "from-violet-500 via-indigo-700 to-indigo-950", Aço: "from-slate-300 via-slate-500 to-slate-700",
  Fada: "from-pink-300 via-rose-400 to-pink-600",
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  Normal: "bg-neutral-600 text-white", Fogo: "bg-red-600 text-white", Água: "bg-blue-600 text-white",
  Planta: "bg-green-600 text-white", Elétrico: "bg-yellow-400 text-black", Gelo: "bg-cyan-400 text-black",
  Lutador: "bg-orange-700 text-white", Venenoso: "bg-purple-600 text-white", Terrestre: "bg-amber-700 text-white",
  Voador: "bg-indigo-500 text-white", Psíquico: "bg-pink-600 text-white", Inseto: "bg-lime-600 text-white",
  Pedra: "bg-stone-600 text-white", Fantasma: "bg-purple-900 text-white", Dragão: "bg-violet-700 text-white",
  Aço: "bg-slate-500 text-white", Fada: "bg-pink-400 text-black",
};

export default function PokedexDetailModal({
  pokemonId,
  onClose,
  onNavigate,
  minId,
  maxId,
}: PokedexDetailModalProps) {
  const [isEvoModalOpen, setIsEvoModalOpen] = useState(false);
  const [isShiny, setIsShiny] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  const { data: details, isLoading } = useQuery({
    queryKey: ["pokemonDetails", pokemonId],
    queryFn: () => fetchPokemonDetails(pokemonId!),
    enabled: pokemonId !== null,
  });

  if (pokemonId === null) return null;

  const primaryType = details?.types[0] || "Normal";
  const bgGradient = TYPE_GRADIENTS[primaryType] || "from-slate-500 to-slate-700";

  // 🖼️ CALCULA O ID DA ARTE ATIVA (Normal vs Mega X vs Mega Y vs Regional)
  const activeId = selectedFormId || details?.id || pokemonId;
  const displayArtwork = isShiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${activeId}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${activeId}.png`;

  // 🏷️ CALCULA O NOME DINÂMICO EXATO DA FORMA SELECIONADA
  const activeVariety = details?.varieties.find((v) => v.id === selectedFormId);
  const displayName = activeVariety ? activeVariety.name : details?.name;

  // 🕹️ HELPER: Busca as variedades de um tipo (Ex: Mega X e Mega Y)
  const getVarietiesForType = (formType: PokemonVariety["formType"]) => {
    return details ? details.varieties.filter((v) => v.formType === formType) : [];
  };

  // 🔄 LÓGICA EM CICLO: Reveza entre Normal -> Mega X -> Mega Y -> Normal!
  const toggleFormType = (targetType: PokemonVariety["formType"]) => {
    const matchingForms = getVarietiesForType(targetType);
    if (matchingForms.length === 0) return;

    const currentIndex = matchingForms.findIndex((v) => v.id === selectedFormId);

    if (currentIndex === -1) {
      // Se nenhuma dessa categoria estava selecionada, ativa a 1ª da lista!
      setSelectedFormId(matchingForms[0].id);
    } else if (currentIndex < matchingForms.length - 1) {
      // Se tem mais uma forma na mesma categoria (Ex: Mega X vai para Mega Y)
      setSelectedFormId(matchingForms[currentIndex + 1].id);
    } else {
      // Já está na última forma da lista: desliga e volta ao normal!
      setSelectedFormId(null);
    }
  };

  // Listas de Formas por Categoria
  const megaForms = getVarietiesForType("MEGA");
  const gmaxForms = getVarietiesForType("GIGANTAMAX");
  const dmaxForms = getVarietiesForType("DYNAMAX");
  const regionalForms = getVarietiesForType("REGIONAL");
  const alternativeForms = getVarietiesForType("ALTERNATIVE");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm font-navbar">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          key={pokemonId}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md bg-[#FFFFFF] border border-[#D9D9D9] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        >
          {isLoading || !details ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#EE1515] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-[#1E1E1E]/60">Carregando dados da Pokédex...</p>
            </div>
          ) : (
            <>
              {/* TOPO COLORIDO */}
              <div className={`relative w-full pt-6 pb-12 px-6 bg-gradient-to-b ${bgGradient} rounded-b-[40px] shadow-md shrink-0 flex flex-col items-center`}>
                <div className="w-full flex items-center justify-between z-20">
                  <span className="text-xs font-black bg-black/25 backdrop-blur-md text-[#FFCB05] px-3 py-1 rounded-full border border-white/20 uppercase tracking-wider font-button">
                    📍 {details.region}
                  </span>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-black/25 hover:bg-black/40 text-white font-bold flex items-center justify-center transition border border-white/20 font-button"
                  >
                    ✕
                  </button>
                </div>

                {/* SETAS DE NAVEGAÇÃO FLUTUANTES (< e >) */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center z-20 pointer-events-none">
                  <button
                    onClick={() => { setSelectedFormId(null); setIsShiny(false); onNavigate(pokemonId - 1); }}
                    disabled={pokemonId <= minId}
                    className={`w-10 h-10 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#1B4F9C] font-black text-lg flex items-center justify-center shadow-lg transition pointer-events-auto ${
                      pokemonId <= minId ? "opacity-20 cursor-not-allowed" : "hover:scale-110 active:scale-95"
                    }`}
                  >
                    ❮
                  </button>
                  <button
                    onClick={() => { setSelectedFormId(null); setIsShiny(false); onNavigate(pokemonId + 1); }}
                    disabled={pokemonId >= maxId}
                    className={`w-10 h-10 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#1B4F9C] font-black text-lg flex items-center justify-center shadow-lg transition pointer-events-auto ${
                      pokemonId >= maxId ? "opacity-20 cursor-not-allowed" : "hover:scale-110 active:scale-95"
                    }`}
                  >
                    ❯
                  </button>
                </div>

                {/* ARTE POKÉMON DINÂMICA */}
                <motion.div
                  key={displayArtwork}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="relative w-48 h-48 sm:w-52 sm:h-52 z-10 -mb-6 mt-2 drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)]"
                >
                  <Image
                    src={displayArtwork}
                    alt={displayName || details.name}
                    fill
                    sizes="208px"
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </motion.div>
              </div>

              {/* CORPO DO MODAL */}
              <div className="p-6 pt-8 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-center bg-[#FFFFFF]">
                <div>
                  <div className="text-xs font-bold text-[#1E1E1E]/50 uppercase tracking-widest font-stats">
                    #{String(details.id).padStart(4, "0")} • {details.generation}
                  </div>
                  {/* 👈 EXIBE O NOME DA FORMA ATIVA (Ex: Charizard Mega X ✨) */}
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1E1E1E] tracking-tight mt-0.5 font-heading">
                    {displayName} {isShiny && "✨"}
                  </h2>
                  
                  <div className="flex gap-2 justify-center mt-2">
                    {details.types.map((type) => (
                      <span
                        key={type}
                        className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide shadow-sm font-button ${
                          TYPE_BADGE_COLORS[type] || "bg-gray-500 text-white"
                        }`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#1E1E1E]/80 italic bg-[#F5F5F5] p-3.5 rounded-2xl border border-[#D9D9D9] leading-relaxed font-body">
                  &quot;{details.flavorText}&quot;
                </p>

                <div className="grid grid-cols-2 gap-3 w-full font-card">
                  <div className="bg-[#F5F5F5] p-3 rounded-2xl border border-[#D9D9D9]">
                    <span className="text-[11px] text-[#1E1E1E]/60 font-bold block uppercase tracking-wider">⚖️ Peso</span>
                    <span className="text-lg font-black text-[#1E1E1E] mt-0.5 block font-stats">{details.weight} kg</span>
                  </div>
                  <div className="bg-[#F5F5F5] p-3 rounded-2xl border border-[#D9D9D9]">
                    <span className="text-[11px] text-[#1E1E1E]/60 font-bold block uppercase tracking-wider">📏 Altura</span>
                    <span className="text-lg font-black text-[#1E1E1E] mt-0.5 block font-stats">{details.height} m</span>
                  </div>
                </div>

                {/* BOTÃO CADEIA EVOLUTIVA */}
                {details.evolutions && details.evolutions.length > 1 && (
                  <button
                    onClick={() => setIsEvoModalOpen(true)}
                    className="w-full py-3 px-4 bg-[#F5F5F5] hover:bg-[#FFFFFF] border border-[#D9D9D9] hover:border-[#2A75BB] rounded-2xl font-black text-sm text-[#1B4F9C] transition flex items-center justify-center gap-2 shadow-sm group font-button"
                  >
                    <span className="text-base">🧬</span>
                    <span>Ver Cadeia Evolutiva ({details.evolutions.length} estágios)</span>
                    <span className="text-xs text-[#1B4F9C]/60 group-hover:translate-x-0.5 transition-transform">↗</span>
                  </button>
                )}

                {/* 🎨 BARRA DE ÍCONES INTERATIVOS COM BADGES DE CONTADOR */}
                <div className="pt-2 border-t border-[#D9D9D9]/60">
                  <div className="flex items-center justify-center gap-2.5 flex-wrap">
                    {/* 1. SHINY (✨) */}
                    <button
                      onClick={() => setIsShiny(!isShiny)}
                      title="Forma Shiny (Brilhante)"
                      className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-xl transition shadow-sm relative ${
                        isShiny
                          ? "bg-[#FFCB05] border-[#1B4F9C] text-[#1B4F9C] scale-110 shadow-md"
                          : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/60 hover:border-[#FFCB05] hover:text-[#1E1E1E]"
                      }`}
                    >
                      ✨
                    </button>

                    {/* 2. MEGA EVOLUÇÃO (🔥) - Com Badge se tiver 2 Megas! */}
                    {megaForms.length > 0 && (
                      <button
                        onClick={() => toggleFormType("MEGA")}
                        title={`Mega Evolução (${megaForms.length} forma${megaForms.length > 1 ? "s" : ""})`}
                        className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-xl transition shadow-sm relative ${
                          megaForms.some((v) => v.id === selectedFormId)
                            ? "bg-[#EE1515] border-[#1B4F9C] text-[#FFFFFF] scale-110 shadow-md"
                            : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/60 hover:border-[#EE1515] hover:text-[#1E1E1E]"
                        }`}
                      >
                        🔥
                        {megaForms.length > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#1E1E1E] text-white font-stats font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow">
                            {megaForms.length}
                          </span>
                        )}
                      </button>
                    )}

                    {/* 3. GIGANTAMAX (☁️) */}
                    {gmaxForms.length > 0 && (
                      <button
                        onClick={() => toggleFormType("GIGANTAMAX")}
                        title={`Gigantamax (${gmaxForms.length} forma${gmaxForms.length > 1 ? "s" : ""})`}
                        className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-xl transition shadow-sm relative ${
                          gmaxForms.some((v) => v.id === selectedFormId)
                            ? "bg-[#2A75BB] border-[#1B4F9C] text-[#FFFFFF] scale-110 shadow-md"
                            : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/60 hover:border-[#2A75BB] hover:text-[#1E1E1E]"
                        }`}
                      >
                        ☁️
                        {gmaxForms.length > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#1E1E1E] text-white font-stats font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow">
                            {gmaxForms.length}
                          </span>
                        )}
                      </button>
                    )}

                    {/* 4. DYNAMAX (⚡) */}
                    {dmaxForms.length > 0 && (
                      <button
                        onClick={() => toggleFormType("DYNAMAX")}
                        title={`Dynamax (${dmaxForms.length} forma${dmaxForms.length > 1 ? "s" : ""})`}
                        className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-xl transition shadow-sm relative ${
                          dmaxForms.some((v) => v.id === selectedFormId)
                            ? "bg-[#FFCB05] border-[#EE1515] text-[#EE1515] scale-110 shadow-md"
                            : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/60 hover:border-[#FFCB05] hover:text-[#1E1E1E]"
                        }`}
                      >
                        ⚡
                        {dmaxForms.length > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#1E1E1E] text-white font-stats font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow">
                            {dmaxForms.length}
                          </span>
                        )}
                      </button>
                    )}

                    {/* 5. FORMAS REGIONAIS (🌍) */}
                    {regionalForms.length > 0 && (
                      <button
                        onClick={() => toggleFormType("REGIONAL")}
                        title={`Forma Regional (${regionalForms.length} forma${regionalForms.length > 1 ? "s" : ""})`}
                        className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-xl transition shadow-sm relative ${
                          regionalForms.some((v) => v.id === selectedFormId)
                            ? "bg-[#1B4F9C] border-[#2A75BB] text-[#FFFFFF] scale-110 shadow-md"
                            : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/60 hover:border-[#1B4F9C] hover:text-[#1E1E1E]"
                        }`}
                      >
                        🌍
                        {regionalForms.length > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#1E1E1E] text-white font-stats font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow">
                            {regionalForms.length}
                          </span>
                        )}
                      </button>
                    )}

                    {/* 6. FORMAS ALTERNATIVAS (🔄) */}
                    {alternativeForms.length > 0 && (
                      <button
                        onClick={() => toggleFormType("ALTERNATIVE")}
                        title={`Formas Alternativas (${alternativeForms.length} forma${alternativeForms.length > 1 ? "s" : ""})`}
                        className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-xl transition shadow-sm relative ${
                          alternativeForms.some((v) => v.id === selectedFormId)
                            ? "bg-[#2A75BB] border-[#1B4F9C] text-[#FFFFFF] scale-110 shadow-md"
                            : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/60 hover:border-[#2A75BB] hover:text-[#1E1E1E]"
                        }`}
                      >
                        🔄
                        {alternativeForms.length > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#1E1E1E] text-white font-stats font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow">
                            {alternativeForms.length}
                          </span>
                        )}
                      </button>
                    )}

                    {/* 7. MACHO/FÊMEA (♂️/♀️) */}
                    {details.hasGenderDifferences && (
                      <button
                        onClick={() => setIsShiny(!isShiny)}
                        title="Diferença Visual Macho/Fêmea"
                        className="w-11 h-11 rounded-2xl border-2 border-[#D9D9D9] bg-[#F5F5F5] hover:border-[#EE1515] flex items-center justify-center text-base transition shadow-sm text-[#1E1E1E]/70 hover:scale-105"
                      >
                        ♂️♀️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {details && (
          <EvolutionModal
            isOpen={isEvoModalOpen}
            onClose={() => setIsEvoModalOpen(false)}
            evolutions={details.evolutions}
            currentId={details.id}
          />
        )}
      </div>
    </AnimatePresence>
  );
}