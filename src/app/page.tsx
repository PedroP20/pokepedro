// src/app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore, GameMode, AnswerMode } from "@/store/useGameStore";
import { Region, OrderType, REGION_RANGES } from "@/types/pokemon";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ALL_TYPES_PT } from "@/lib/pokemonConstants";
import { generateFilteredQueue } from "@/lib/pokemonFilters";

const REGIONS_LIST: { id: Region; name: string; total: string; mascotId: number; badgeBg: string; borderColor: string; }[] = [
  { id: "ALL", name: "Todas as Regiões", total: "1025", mascotId: 25, badgeBg: "from-blue-600 to-indigo-700", borderColor: "border-[#2A75BB]" },
  { id: "KANTO", name: "Kanto (1ª Gen)", total: "151", mascotId: 6, badgeBg: "from-red-500 to-orange-600", borderColor: "border-[#EE1515]" },
  { id: "JOHTO", name: "Johto (2ª Gen)", total: "100", mascotId: 249, badgeBg: "from-amber-400 to-yellow-600", borderColor: "border-[#FFCB05]" },
  { id: "HOENN", name: "Hoenn (3ª Gen)", total: "135", mascotId: 384, badgeBg: "from-emerald-500 to-green-700", borderColor: "border-emerald-500" },
  { id: "SINNOH", name: "Sinnoh (4ª Gen)", total: "107", mascotId: 448, badgeBg: "from-purple-500 to-indigo-700", borderColor: "border-purple-500" },
  { id: "UNOVA", name: "Unova (5ª Gen)", total: "156", mascotId: 571, badgeBg: "from-slate-600 to-slate-800", borderColor: "border-slate-600" },
  { id: "KALOS", name: "Kalos (6ª Gen)", total: "72", mascotId: 658, badgeBg: "from-blue-500 to-cyan-600", borderColor: "border-cyan-500" },
  { id: "ALOLA", name: "Alola (7ª Gen)", total: "88", mascotId: 778, badgeBg: "from-orange-400 to-pink-500", borderColor: "border-orange-400" },
  { id: "GALAR", name: "Galar (8ª Gen)", total: "89", mascotId: 815, badgeBg: "from-rose-500 to-red-600", borderColor: "border-rose-500" },
  { id: "PALDEA", name: "Paldea (9ª Gen)", total: "120", mascotId: 908, badgeBg: "from-violet-500 to-purple-600", borderColor: "border-violet-500" },
];

export default function Home() {
  const router = useRouter();
  const startGame = useGameStore((state) => state.startGame);

  const [selectedMode, setSelectedMode] = useState<GameMode>("NORMAL");
  const [selectedAnswerMode, setSelectedAnswerMode] = useState<AnswerMode>("OPTIONS");
  const [selectedRegion, setSelectedRegion] = useState<Region>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderType>("RANDOM");
  const [isSilhouette, setIsSilhouette] = useState(false);

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [onlyLegendaries, setOnlyLegendaries] = useState(false);
  const [onlyMythicals, setOnlyMythicals] = useState(false);
  const [onlyUltraBeasts, setOnlyUltraBeasts] = useState(false);
  const [onlyParadox, setOnlyParadox] = useState(false);
  
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false); // Modal Como Jogar

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };

  const hasAnyFilterActive = selectedTypes.length > 0 || onlyLegendaries || onlyMythicals || onlyUltraBeasts || onlyParadox;

  const clearFilters = () => {
    setSelectedTypes([]);
    setOnlyLegendaries(false);
    setOnlyMythicals(false);
    setOnlyUltraBeasts(false);
    setOnlyParadox(false);
  };

  const handleStartGame = async () => {
    setIsLoadingQueue(true);
    try {
      const [min, max] = REGION_RANGES[selectedRegion] || [1, 1025];
      const allRegionIds = Array.from({ length: max - min + 1 }, (_, i) => min + i);

      const filteredIds = await generateFilteredQueue({
        region: selectedRegion,
        selectedTypes,
        onlyLegendaries,
        onlyMythicals,
        onlyUltraBeasts,
        onlyParadox,
      }, allRegionIds);

      if (filteredIds.length === 0) {
        alert("⚠️ Nenhum Pokémon encontrado com esta combinação! Tente desmarcar alguns filtros.");
        setIsLoadingQueue(false);
        return;
      }

      startGame(selectedRegion, selectedOrder, isSilhouette, selectedMode, selectedAnswerMode, filteredIds);
      router.push("/game");
    } catch (error) {
      console.error("Erro nos filtros:", error);
      startGame(selectedRegion, selectedOrder, isSilhouette, selectedMode, selectedAnswerMode);
      router.push("/game");
    } finally {
      setIsLoadingQueue(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-5xl mx-auto w-full my-auto font-body relative">
      
      {/* 🌟 HERO SECTION COM BOTÃO DE AJUDA */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 sm:space-y-3 my-4 sm:my-6 w-full">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#2A75BB]/10 border border-[#2A75BB]/30 text-[#1B4F9C] font-button font-extrabold text-xs uppercase tracking-widest shadow-sm">
            ⚡ Treinamento Oficial
          </span>
          <button
            onClick={() => setShowHowToPlay(true)}
            className="px-3.5 py-1 rounded-full bg-[#FFCB05] text-[#1B4F9C] font-button font-black text-xs uppercase tracking-wider shadow hover:scale-105 transition flex items-center gap-1"
          >
            <span>❓</span> Como Jogar
          </button>
        </div>
        <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight leading-tight text-[#1B4F9C]">
          Mestre da <span className="text-[#EE1515] drop-shadow-sm">Pokédex</span>
        </h1>
        <p className="text-[#1E1E1E]/70 max-w-xl mx-auto text-xs sm:text-base px-2 font-medium">
          Escolha sua região favorita, memorize as artes oficiais e prove que você reconhece todos os Pokémon!
        </p>
      </motion.div>

      {/* 🎮 CARD DE COMANDO PRINCIPAL */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="w-full max-w-3xl bg-[#FFFFFF] border-2 border-[#1B4F9C]/20 rounded-3xl shadow-2xl overflow-hidden font-card">
        
        {/* Topo Console */}
        <div className="bg-gradient-to-r from-[#1B4F9C] via-[#2A75BB] to-[#1B4F9C] px-6 py-4 flex items-center justify-between text-[#FFFFFF] shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-spin-slow">🔴</span>
            <h2 className="text-base sm:text-lg font-heading font-black tracking-wide uppercase">Central de Desafios</h2>
          </div>
          <span className="text-xs font-stats font-bold bg-[#FFCB05] text-[#1B4F9C] px-3 py-1 rounded-full shadow-sm">SELECT REGION</span>
        </div>

        {/* Corpo do Card */}
        <div className="p-4 sm:p-8 space-y-6">
          
          {/* 1. MODO DE JOGO */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] flex items-center gap-1.5">
              <span>🕹️</span> <span>1. Escolha o Modo de Treinamento:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedMode("NORMAL")}
                className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between shadow-sm ${
                  selectedMode === "NORMAL" ? "bg-[#2A75BB]/10 border-[#2A75BB] ring-2 ring-[#2A75BB]/20" : "bg-[#F5F5F5] border-[#D9D9D9] hover:bg-[#FFFFFF]"
                }`}
              >
                <span className="text-sm sm:text-base font-button font-black text-[#1E1E1E] flex items-center gap-1.5"><span>🎲</span> Modo Clássico</span>
                <p className="text-[11px] sm:text-xs text-[#1E1E1E]/60 mt-1 font-body leading-tight">Adivinhe os Pokémon em sequência padrão da região escolhida.</p>
              </button>

              <button
                onClick={() => setSelectedMode("ADVANCED")}
                className={`p-3.5 rounded-2xl border-2 text-left transition flex flex-col justify-between shadow-sm relative overflow-hidden ${
                  selectedMode === "ADVANCED" ? "bg-[#EE1515]/10 border-[#EE1515] ring-2 ring-[#EE1515]/20" : "bg-[#F5F5F5] border-[#D9D9D9] hover:bg-[#FFFFFF]"
                }`}
              >
                <span className="absolute top-0 right-0 bg-[#FFCB05] text-[#1B4F9C] font-stats font-black text-[9px] px-2 py-0.5 rounded-bl uppercase">SRS ⭐</span>
                <span className="text-sm sm:text-base font-button font-black text-[#EE1515] flex items-center gap-1.5"><span>🧠</span> Aprendizado Avançado</span>
                <p className="text-[11px] sm:text-xs text-[#1E1E1E]/60 mt-1 font-body leading-tight">Pokémon errados reaparecem mais à frente para você memorizar.</p>
              </button>
            </div>
          </div>

          {/* 2. SELEÇÃO DE REGIÃO */}
          <div className="space-y-3 pt-2 border-t border-[#D9D9D9]/60">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] flex items-center gap-1.5">
                <span>📍</span> <span>2. Escolha a Região do Desafio:</span>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 max-h-64 sm:max-h-72 overflow-y-auto custom-scrollbar p-1">
              {REGIONS_LIST.map((reg) => {
                const isSelected = selectedRegion === reg.id;
                return (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedRegion(reg.id)}
                    className={`relative group overflow-hidden rounded-2xl p-3 text-left transition-all duration-200 flex items-center justify-between border-2 ${
                      isSelected ? `bg-gradient-to-br ${reg.badgeBg} text-[#FFFFFF] border-transparent shadow-lg scale-102 ring-2 ring-[#FFCB05]` : "bg-[#F5F5F5] text-[#1E1E1E] border-[#D9D9D9] hover:border-[#2A75BB] shadow-sm"
                    }`}
                  >
                    <div className="z-10 flex flex-col justify-between h-full space-y-1 my-auto">
                      <span className="text-xs sm:text-sm font-button font-black truncate max-w-[100px] leading-tight">{reg.name}</span>
                      <span className={`text-[10px] font-stats font-bold px-1.5 py-0.5 rounded w-fit ${isSelected ? "bg-black/30 text-[#FFCB05]" : "bg-[#D9D9D9]/70 text-[#1E1E1E]/80"}`}>{reg.total} PKMN</span>
                    </div>
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 -mr-1 group-hover:scale-110 transition-transform">
                      <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${reg.mascotId}.png`} alt={reg.name} fill sizes="56px" className="object-contain drop-shadow-md" unoptimized />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. FILTROS POR TIPO E RARIDADE */}
          <div className="space-y-3 pt-2 border-t border-[#D9D9D9]/60">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] flex items-center gap-1.5">
                <span>🔥</span> <span>3. Filtros por Tipo e Raridade (Opcional):</span>
              </label>
              {hasAnyFilterActive && <button onClick={clearFilters} className="text-[11px] text-[#EE1515] font-button font-black hover:underline bg-red-50 px-2 py-0.5 rounded border border-red-200">Limpar ✕</button>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setOnlyLegendaries(!onlyLegendaries)} className={`px-3 py-1 rounded-xl border text-xs font-button font-bold transition ${onlyLegendaries ? "bg-[#FFCB05] border-[#1E1E1E] font-black shadow" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70"}`}>👑 Lendários</button>
              <button onClick={() => setOnlyMythicals(!onlyMythicals)} className={`px-3 py-1 rounded-xl border text-xs font-button font-bold transition ${onlyMythicals ? "bg-purple-600 text-white font-black shadow" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70"}`}>✨ Míticos</button>
              <button onClick={() => setOnlyUltraBeasts(!onlyUltraBeasts)} className={`px-3 py-1 rounded-xl border text-xs font-button font-bold transition ${onlyUltraBeasts ? "bg-cyan-600 text-white font-black shadow" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70"}`}>🌌 Ultra Beasts</button>
              <button onClick={() => setOnlyParadox(!onlyParadox)} className={`px-3 py-1 rounded-xl border text-xs font-button font-bold transition ${onlyParadox ? "bg-rose-600 text-white font-black shadow" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70"}`}>⏳ Paradox</button>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {ALL_TYPES_PT.map((type) => (
                <button key={type} onClick={() => toggleType(type)} className={`px-2.5 py-1 rounded-lg border text-[11px] font-button font-bold transition ${selectedTypes.includes(type) ? "bg-[#1B4F9C] text-white shadow" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70"}`}>{type}</button>
              ))}
            </div>
          </div>

          {/* 4. ORDEM DE EXIBIÇÃO & DESAFIO VISUAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D9D9D9]/60">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] block">🔀 4. Ordem de Exibição:</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSelectedOrder("RANDOM")} className={`py-3 px-3 rounded-xl border-2 text-xs font-button font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${selectedOrder === "RANDOM" ? "bg-[#FFCB05] border-[#1B4F9C] text-[#1B4F9C] font-black" : "bg-[#F5F5F5] text-[#1E1E1E]/70"}`}><span>🎲</span> Aleatória</button>
                <button onClick={() => setSelectedOrder("POKEDEX")} className={`py-3 px-3 rounded-xl border-2 text-xs font-button font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${selectedOrder === "POKEDEX" ? "bg-[#FFCB05] border-[#1B4F9C] text-[#1B4F9C] font-black" : "bg-[#F5F5F5] text-[#1E1E1E]/70"}`}><span>🔢</span> Numérica</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] block">👁️ Desafio Visual:</label>
              <button onClick={() => setIsSilhouette(!isSilhouette)} className={`w-full py-3 px-4 rounded-xl border-2 text-xs font-button font-black transition flex items-center justify-center gap-2 shadow-sm ${isSilhouette ? "bg-gradient-to-r from-purple-800 to-indigo-900 border-purple-500 text-white ring-2 ring-purple-300" : "bg-[#F5F5F5] text-[#1E1E1E]/80"}`}><span>{isSilhouette ? "👤 Silhueta Ativada" : "🖼️ Foto Normal"}</span></button>
            </div>
          </div>

          {/* ✍️ 5. NOVO SELETOR: MODO DE RESPOSTA (BOTÕES VS DIGITAÇÃO) */}
          <div className="space-y-2 pt-2 border-t border-[#D9D9D9]/60">
            <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] block">
              ✍️ 5. Modo de Resposta:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedAnswerMode("OPTIONS")}
                className={`py-3 px-4 rounded-xl border-2 text-xs sm:text-sm font-button font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                  selectedAnswerMode === "OPTIONS" ? "bg-[#1B4F9C] border-[#1B4F9C] text-white font-black" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70"
                }`}
              >
                <span>🔘</span> <span>4 Alternativas (Fácil)</span>
              </button>
              <button
                onClick={() => setSelectedAnswerMode("TYPING")}
                className={`py-3 px-4 rounded-xl border-2 text-xs sm:text-sm font-button font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                  selectedAnswerMode === "TYPING" ? "bg-[#EE1515] border-[#EE1515] text-white font-black" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70"
                }`}
              >
                <span>⌨️</span> <span>Digitação Ativa (Desafio)</span>
              </button>
            </div>
            {selectedAnswerMode === "TYPING" && (
              <p className="text-[11px] text-[#EE1515] font-body font-bold text-center">
                ✨ Sistema Ortográfico Inteligente: Aceitamos pequenos erros de digitação sem penalidade!
              </p>
            )}
          </div>

          {/* 🚀 BOTÃO DE INICIAR */}
          <div className="pt-2">
            <button onClick={handleStartGame} disabled={isLoadingQueue} className={`w-full py-4 sm:py-5 bg-gradient-to-r from-[#EE1515] via-[#cc1010] to-[#EE1515] hover:from-[#ff1f1f] text-white font-button font-black text-lg sm:text-xl rounded-2xl shadow-lg flex items-center justify-center gap-3 border-2 border-[#FFCB05]/40 ${isLoadingQueue ? "opacity-75 cursor-not-allowed" : ""}`}>
              {isLoadingQueue ? <span>GERANDO POKÉDEX...</span> : <><span>🚀</span><span>INICIAR DESAFIO AGORA</span><span>⚡</span></>}
            </button>
          </div>

        </div>
      </motion.div>

      {/* ❓ MODAL COMO JOGAR (TUTORIAL COMPLETO E ACESSÍVEL) */}
      <AnimatePresence>
        {showHowToPlay && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto font-body space-y-6 shadow-2xl relative border-4 border-[#1B4F9C]">
              
              <button onClick={() => setShowHowToPlay(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 font-black text-lg flex items-center justify-center transition">
                ✕
              </button>

              <div className="text-center space-y-1">
                <span className="text-4xl inline-block">📖</span>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#1B4F9C]">Guia Oficial: Como Jogar?</h2>
                <p className="text-xs sm:text-sm text-[#1E1E1E]/70 font-medium">Um guia super simples para todas as idades aprenderem a jogar!</p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#1E1E1E] divide-y divide-gray-100">
                <div className="pt-2 space-y-1">
                  <h3 className="font-heading font-black text-base text-[#2A75BB] flex items-center gap-1.5"><span>🎲</span> 1. Os Dois Modos de Jogo</h3>
                  <p><b>• Modo Clássico:</b> É o jogo padrão! Você escolhe uma região e tenta adivinhar todos os Pokémon dela, um por um.</p>
                  <p><b>• Aprendizado Avançado (SRS):</b> Feito para memorizar! Quando você erra um Pokémon, o jogo guarda ele e mostra de novo 3 rodadas depois, até você aprender o nome certo!</p>
                </div>

                <div className="pt-4 space-y-1">
                  <h3 className="font-heading font-black text-base text-[#EE1515] flex items-center gap-1.5"><span>✍️</span> 2. Botões ou Digitação?</h3>
                  <p><b>• 4 Alternativas:</b> O modo mais fácil. Basta clicar no botão com o nome correto.</p>
                  <p><b>• Digitação Ativa:</b> Para os verdadeiros Mestres! Você deve escrever o nome do Pokémon usando o teclado. <i>Não se preocupe:</i> se você errar apenas uma letrinha ou acento , nosso sistema inteligente perdoa e conta como acerto!</p>
                </div>

                <div className="pt-4 space-y-1">
                  <h3 className="font-heading font-black text-base text-purple-700 flex items-center gap-1.5"><span>👑</span> 3. Filtros e Silhueta</h3>
                  <p>Você pode combinar filtros para deixar o jogo do seu jeito: jogar apenas com <b>Lendários</b>, escolher Pokémon só do tipo <b>Fogo</b>, ou ativar o <b>Modo Silhueta</b> (onde a foto fica toda preta para você adivinhar só pelo contorno!).</p>
                </div>

                <div className="pt-4 space-y-1">
                  <h3 className="font-heading font-black text-base text-emerald-700 flex items-center gap-1.5"><span>📚</span> 4. A Central de Revisão</h3>
                  <p>No menu superior, clique em <b>Revisão</b> para ver todos os Pokémon que você errou ou demorou para responder. É a sua biblioteca pessoal para estudar antes de tentar de novo!</p>
                </div>
              </div>

              <button onClick={() => setShowHowToPlay(false)} className="w-full py-4 bg-[#1B4F9C] hover:bg-[#153e7a] text-white font-button font-black text-base rounded-2xl shadow-lg transition">
                Entendi, Quero Treinar Agora! 🚀
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}