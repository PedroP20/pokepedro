"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";
import { Region, OrderType } from "@/types/pokemon";
import { motion } from "framer-motion";
import Image from "next/image";

// 🌟 DATA ESTRUTURADA COM MASCOTES OFICIAIS E CORES TEMÁTICAS PARA CADA REGIÃO
const REGIONS_LIST: {
  id: Region;
  name: string;
  total: string;
  mascotId: number;
  badgeBg: string;
  borderColor: string;
}[] = [
  { id: "ALL", name: "Todas as Regiões", total: "1025", mascotId: 25, badgeBg: "from-blue-600 to-indigo-700", borderColor: "border-[#2A75BB]" }, // Pikachu
  { id: "KANTO", name: "Kanto (1ª Gen)", total: "151", mascotId: 6, badgeBg: "from-red-500 to-orange-600", borderColor: "border-[#EE1515]" }, // Charizard
  { id: "JOHTO", name: "Johto (2ª Gen)", total: "100", mascotId: 249, badgeBg: "from-amber-400 to-yellow-600", borderColor: "border-[#FFCB05]" }, // Lugia
  { id: "HOENN", name: "Hoenn (3ª Gen)", total: "135", mascotId: 384, badgeBg: "from-emerald-500 to-green-700", borderColor: "border-emerald-500" }, // Rayquaza
  { id: "SINNOH", name: "Sinnoh (4ª Gen)", total: "107", mascotId: 448, badgeBg: "from-purple-500 to-indigo-700", borderColor: "border-purple-500" }, // Lucario
  { id: "UNOVA", name: "Unova (5ª Gen)", total: "156", mascotId: 571, badgeBg: "from-slate-600 to-slate-800", borderColor: "border-slate-600" }, // Zoroark
  { id: "KALOS", name: "Kalos (6ª Gen)", total: "72", mascotId: 658, badgeBg: "from-blue-500 to-cyan-600", borderColor: "border-cyan-500" }, // Greninja
  { id: "ALOLA", name: "Alola (7ª Gen)", total: "88", mascotId: 778, badgeBg: "from-orange-400 to-pink-500", borderColor: "border-orange-400" }, // Mimikyu
  { id: "GALAR", name: "Galar (8ª Gen)", total: "89", mascotId: 815, badgeBg: "from-rose-500 to-red-600", borderColor: "border-rose-500" }, // Cinderace
  { id: "PALDEA", name: "Paldea (9ª Gen)", total: "120", mascotId: 908, badgeBg: "from-violet-500 to-purple-600", borderColor: "border-violet-500" }, // Meowscarada
];

export default function Home() {
  const router = useRouter();
  const startGame = useGameStore((state) => state.startGame);

  const [selectedRegion, setSelectedRegion] = useState<Region>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderType>("RANDOM");
  const [isSilhouette, setIsSilhouette] = useState(false);

  const handleStartGame = () => {
    startGame(selectedRegion, selectedOrder, isSilhouette);
    router.push("/game");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-5xl mx-auto w-full my-auto font-body">
      {/* 🌟 HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 sm:space-y-3 my-4 sm:my-6 w-full"
      >
        <span className="inline-block px-3.5 py-1 rounded-full bg-[#2A75BB]/10 border border-[#2A75BB]/30 text-[#1B4F9C] font-button font-extrabold text-[11px] sm:text-xs uppercase tracking-widest shadow-sm">
          ⚡ Treinamento Oficial
        </span>
        <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight leading-tight text-[#1B4F9C]">
          Mestre da <span className="text-[#EE1515] drop-shadow-sm">Pokédex</span>
        </h1>
        <p className="text-[#1E1E1E]/70 max-w-xl mx-auto text-xs sm:text-base px-2 font-medium">
          Escolha sua região favorita, memorize as artes oficiais e prove que você reconhece todos os Pokémon!
        </p>
      </motion.div>

      {/* 🎮 O NOVO CARD DE COMANDO POKÉMON */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-3xl bg-[#FFFFFF] border-2 border-[#1B4F9C]/20 rounded-3xl shadow-2xl overflow-hidden font-card"
      >
        {/* Topo Estilizado como Console Gamer */}
        <div className="bg-gradient-to-r from-[#1B4F9C] via-[#2A75BB] to-[#1B4F9C] px-6 py-4 flex items-center justify-between text-[#FFFFFF] shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-spin-slow">🔴</span>
            <h2 className="text-base sm:text-lg font-heading font-black tracking-wide uppercase">
              Central de Desafios
            </h2>
          </div>
          <span className="text-xs font-stats font-bold bg-[#FFCB05] text-[#1B4F9C] px-3 py-1 rounded-full shadow-sm">
            SELECT REGION
          </span>
        </div>

        {/* Corpo do Card */}
        <div className="p-4 sm:p-8 space-y-6">
          {/* 1. SELEÇÃO DE REGIÃO COM MASCOTES INTERATIVOS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] flex items-center gap-1.5">
                <span>📍</span> <span>1. Escolha a Região do Desafio:</span>
              </label>
              <span className="text-[11px] font-bold text-[#1E1E1E]/50">
                Toque para selecionar
              </span>
            </div>

            {/* Grid de Regiões Repaginado (2 Colunas no Mobile, 3/4 no PC) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 max-h-64 sm:max-h-72 overflow-y-auto custom-scrollbar p-1">
              {REGIONS_LIST.map((reg) => {
                const isSelected = selectedRegion === reg.id;
                const mascotUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${reg.mascotId}.png`;

                return (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedRegion(reg.id)}
                    className={`relative group overflow-hidden rounded-2xl p-3 text-left transition-all duration-200 flex items-center justify-between border-2 ${
                      isSelected
                        ? `bg-gradient-to-br ${reg.badgeBg} text-[#FFFFFF] border-transparent shadow-lg scale-102 ring-2 ring-[#FFCB05]`
                        : "bg-[#F5F5F5] text-[#1E1E1E] border-[#D9D9D9] hover:border-[#2A75BB] hover:bg-[#FFFFFF] shadow-sm"
                    }`}
                  >
                    {/* Brilho de Fundo da Insígnia */}
                    {isSelected && (
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/20 rounded-full blur-xl pointer-events-none" />
                    )}

                    {/* Informações da Região */}
                    <div className="z-10 flex flex-col justify-between h-full space-y-1 my-auto">
                      <span className="text-xs sm:text-sm font-button font-black truncate max-w-[90px] sm:max-w-[110px] leading-tight">
                        {reg.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-stats font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? "bg-black/30 text-[#FFCB05]" : "bg-[#D9D9D9]/70 text-[#1E1E1E]/80"
                        }`}>
                          {reg.total}
                        </span>
                        <span className={`text-[9px] font-bold ${isSelected ? "text-white/80" : "text-[#1E1E1E]/50"}`}>
                          PKMN
                        </span>
                      </div>
                    </div>

                    {/* 🐉 FOTO/SVG DO POKÉMON MASCOTE DA REGIÃO */}
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 -mr-1 group-hover:scale-110 transition-transform">
                      <Image
                        src={mascotUrl}
                        alt={`Mascote ${reg.name}`}
                        fill
                        sizes="56px"
                        className={`object-contain drop-shadow-md ${
                          isSelected ? "brightness-110 filter" : "opacity-85 group-hover:opacity-100"
                        }`}
                        unoptimized
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ORDEM DE EXIBIÇÃO & 3. DESAFIO VISUAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D9D9D9]/60">
            {/* Ordem */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] block">
                🔀 2. Ordem de Exibição:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedOrder("RANDOM")}
                  className={`py-3 px-3 rounded-xl border-2 text-xs sm:text-sm font-button font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                    selectedOrder === "RANDOM"
                      ? "bg-[#FFCB05] border-[#1B4F9C] text-[#1B4F9C] font-black scale-102"
                      : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70 hover:bg-[#FFFFFF]"
                  }`}
                >
                  <span>🎲</span> <span>Aleatória</span>
                </button>
                <button
                  onClick={() => setSelectedOrder("POKEDEX")}
                  className={`py-3 px-3 rounded-xl border-2 text-xs sm:text-sm font-button font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                    selectedOrder === "POKEDEX"
                      ? "bg-[#FFCB05] border-[#1B4F9C] text-[#1B4F9C] font-black scale-102"
                      : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70 hover:bg-[#FFFFFF]"
                  }`}
                >
                  <span>🔢</span> <span>Numérica</span>
                </button>
              </div>
            </div>

            {/* Modo Silhueta */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] block">
                👁️ 3. Desafio Visual:
              </label>
              <button
                onClick={() => setIsSilhouette(!isSilhouette)}
                className={`w-full py-3 px-4 rounded-xl border-2 text-xs sm:text-sm font-button font-black transition flex items-center justify-center gap-2 shadow-sm ${
                  isSilhouette
                    ? "bg-gradient-to-r from-purple-800 to-indigo-900 border-purple-500 text-[#FFFFFF] scale-102 ring-2 ring-purple-300"
                    : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/80 hover:bg-[#FFFFFF] hover:border-[#2A75BB]"
                }`}
              >
                <span>{isSilhouette ? "👤 Silhueta Ativada (Mais Difícil!)" : "🖼️ Foto Normal (Recomendado)"}</span>
              </button>
            </div>
          </div>

          {/* 🚀 BOTÃO DE ACIONAMENTO GIGANTE ESTILO ARCADE */}
          <div className="pt-2">
            <button
              onClick={handleStartGame}
              className="w-full py-4 sm:py-5 bg-gradient-to-r from-[#EE1515] via-[#cc1010] to-[#EE1515] hover:from-[#ff1f1f] hover:to-[#cc1010] active:scale-98 text-[#FFFFFF] font-button font-black text-lg sm:text-xl rounded-2xl transition duration-200 shadow-[0_6px_0_#990000,0_15px_20px_rgba(238,21,21,0.3)] hover:shadow-[0_4px_0_#990000,0_10px_15px_rgba(238,21,21,0.4)] flex items-center justify-center gap-3 group border-2 border-[#FFCB05]/40"
            >
              <span className="text-2xl group-hover:rotate-12 transition-transform">🚀</span>
              <span className="tracking-wide">INICIAR DESAFIO AGORA</span>
              <span className="text-2xl group-hover:translate-x-1.5 transition-transform">⚡</span>
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}