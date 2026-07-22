// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useGameStore, GameMode, AnswerMode, MediaStyle, MultiplayerType } from "@/store/useGameStore";
import { useSavedGameStore } from "@/store/useSavedGameStore";
import { useLearningStore } from "@/store/useLearningStore"; // ⭐ IMPORT NOVO
import { Region, OrderType, REGION_RANGES } from "@/types/pokemon";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { generateFilteredQueue } from "@/lib/pokemonFilters";

const REGIONS_LIST = [
  { id: "ALL", name: "Todas as Regiões", total: "1025", mascotId: 25, badgeBg: "from-blue-600 to-indigo-700" },
  { id: "KANTO", name: "Kanto (1ª Gen)", total: "151", mascotId: 6, badgeBg: "from-red-500 to-orange-600" },
  { id: "JOHTO", name: "Johto (2ª Gen)", total: "100", mascotId: 249, badgeBg: "from-amber-400 to-yellow-600" },
  { id: "HOENN", name: "Hoenn (3ª Gen)", total: "135", mascotId: 384, badgeBg: "from-emerald-500 to-green-700" },
  { id: "SINNOH", name: "Sinnoh (4ª Gen)", total: "107", mascotId: 448, badgeBg: "from-purple-500 to-indigo-700" },
  { id: "UNOVA", name: "Unova (5ª Gen)", total: "156", mascotId: 571, badgeBg: "from-slate-600 to-slate-800" },
  { id: "KALOS", name: "Kalos (6ª Gen)", total: "72", mascotId: 658, badgeBg: "from-blue-500 to-cyan-600" },
  { id: "ALOLA", name: "Alola (7ª Gen)", total: "88", mascotId: 778, badgeBg: "from-orange-400 to-pink-500" },
  { id: "GALAR", name: "Galar (8ª Gen)", total: "89", mascotId: 815, badgeBg: "from-rose-500 to-red-600" },
  { id: "PALDEA", name: "Paldea (9ª Gen)", total: "120", mascotId: 908, badgeBg: "from-violet-500 to-purple-600" },
];

const TYPES_LIST = [
  { name: "Normal", en: "normal", bg: "bg-[#A8A77A]" },
  { name: "Fogo", en: "fire", bg: "bg-[#EE8130]" },
  { name: "Água", en: "water", bg: "bg-[#6390F0]" },
  { name: "Planta", en: "grass", bg: "bg-[#7AC74C]" },
  { name: "Elétrico", en: "electric", bg: "bg-[#F7D02C]" },
  { name: "Gelo", en: "ice", bg: "bg-[#96D9D6]" },
  { name: "Lutador", en: "fighting", bg: "bg-[#C22E28]" },
  { name: "Veneno", en: "poison", bg: "bg-[#A33EA1]" },
  { name: "Terra", en: "ground", bg: "bg-[#E2BF65]" },
  { name: "Voador", en: "flying", bg: "bg-[#A98FF3]" },
  { name: "Psíquico", en: "psychic", bg: "bg-[#F95587]" },
  { name: "Inseto", en: "bug", bg: "bg-[#A6B91A]" },
  { name: "Pedra", en: "rock", bg: "bg-[#B6A136]" },
  { name: "Fantasma", en: "ghost", bg: "bg-[#735797]" },
  { name: "Dragão", en: "dragon", bg: "bg-[#6F35FC]" },
  { name: "Sombrio", en: "dark", bg: "bg-[#705746]" },
  { name: "Aço", en: "steel", bg: "bg-[#B7B7CE]" },
  { name: "Fada", en: "fairy", bg: "bg-[#D685AD]" },
];

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const startGame = useGameStore((state) => state.startGame);
  const { savedSession, clearSavedGame } = useSavedGameStore();

  const [selectedMode, setSelectedMode] = useState<GameMode>("NORMAL");
  const [mediaStyle, setMediaStyle] = useState<MediaStyle>('IMAGE');
  const [selectedAnswerMode, setSelectedAnswerMode] = useState<AnswerMode>("OPTIONS");
  const [sessionSaveMode, setSessionSaveMode] = useState<'NORMAL' | 'SAVED'>('NORMAL');
  
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [multiplayerType, setMultiplayerType] = useState<MultiplayerType>('FFA');
  const [playerCount, setPlayerCount] = useState(2);

  const [selectedRegion, setSelectedRegion] = useState<Region>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderType>("RANDOM");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  const [onlyLegendaries, setOnlyLegendaries] = useState(false);
  const [onlyMythicals, setOnlyMythicals] = useState(false);
  const [onlyUltraBeasts, setOnlyUltraBeasts] = useState(false);
  const [onlyParadox, setOnlyParadox] = useState(false);
  const [onlyDifficult, setOnlyDifficult] = useState(false); // ⭐ NOVO ESTADO
  
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setIsMounted(true); }, 0);
    if (!isLoading && !user) router.push("/login");
    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  const toggleType = (typeName: string) => setSelectedTypes((prev) => prev.includes(typeName) ? prev.filter((t) => t !== typeName) : [...prev, typeName]);
  
  // Limpar os filtros zera o novo botão também
  const clearFilters = () => { 
    setSelectedTypes([]); setOnlyLegendaries(false); setOnlyMythicals(false); 
    setOnlyUltraBeasts(false); setOnlyParadox(false); setOnlyDifficult(false); 
  };

  const handleStartGame = async () => {
    setIsLoadingQueue(true);
    try {
      const [min, max] = REGION_RANGES[selectedRegion] || [1, 1025];
      const allRegionIds = Array.from({ length: max - min + 1 }, (_, i) => min + i);

      let filteredIds = await generateFilteredQueue({
        region: selectedRegion, selectedTypes, onlyLegendaries, onlyMythicals, onlyUltraBeasts, onlyParadox,
      }, allRegionIds);

      // ⭐ A MÁGICA: Se o filtro estiver ligado, cruzamos os Pokémon filtrados com os que você marcou!
      if (onlyDifficult) {
        const markedIds = useLearningStore.getState().getMarkedDifficultPokemonIds();
        filteredIds = filteredIds.filter(id => markedIds.includes(id));
      }

      if (filteredIds.length === 0) {
        alert("⚠️ Nenhum Pokémon encontrado! Tente desmarcar alguns filtros ou marque alguns Pokémon como dificuldade primeiro."); 
        setIsLoadingQueue(false); 
        return;
      }

      const isPersistent = sessionSaveMode === 'SAVED';
      startGame(selectedRegion, selectedOrder, mediaStyle, selectedMode, selectedAnswerMode, isPersistent, isMultiplayer, multiplayerType, playerCount, filteredIds);
      router.push("/game");
    } catch (e) {
      router.push("/game");
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const handleContinueSavedGame = () => {
    if (!savedSession) return;
    startGame(savedSession.region, savedSession.order, savedSession.mediaStyle, savedSession.mode, savedSession.answerMode, true, savedSession.isMultiplayer, savedSession.multiplayerType, savedSession.players.length, savedSession.remainingIds);
    useGameStore.setState({
      status: "PLAYING", score: savedSession.score, totalAnswered: savedSession.totalAnswered, streak: savedSession.streak,
      currentCorrectId: savedSession.currentCorrectId, sessionStartTime: savedSession.sessionStartTime,
      players: savedSession.players, currentPlayerIndex: savedSession.currentPlayerIndex,
    });
    router.push("/game");
  };

  if (isLoading || !user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F5F5F5]">
        <div className="w-12 h-12 border-4 border-[#1B4F9C] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-button font-black text-[#1B4F9C] animate-pulse uppercase tracking-widest">Acessando Central...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 max-w-6xl mx-auto w-full font-body relative">
      
      {/* 🌟 HERO SECTION ESPAÇOSA */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 my-2 sm:my-4 w-full">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#2A75BB]/10 border border-[#2A75BB]/30 text-[#1B4F9C] font-button font-extrabold text-xs uppercase tracking-widest shadow-sm">⚡ Treinamento Oficial</span>
          <button onClick={() => setShowHowToPlay(true)} className="px-3.5 py-1 rounded-full bg-[#FFCB05] text-[#1B4F9C] font-button font-black text-xs uppercase shadow hover:scale-105 transition">❓ Como Jogar</button>
        </div>
        <h1 className="text-4xl sm:text-6xl font-heading font-black text-[#1B4F9C]">Adivinhe o <span className="text-[#EE1515] drop-shadow-sm">Pokémon</span></h1>
      </motion.div>

      {/* 💾 BANNER DE JOGO SALVO EM ABERTO */}
      <AnimatePresence>
        {isMounted && savedSession && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-3xl bg-white border-4 border-green-500 rounded-3xl p-5 my-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-stats">
            <div className="flex items-center gap-3.5"><span className="text-4xl">💾</span><div><span className="px-2.5 py-0.5 bg-green-100 text-green-800 font-button font-black text-[10px] rounded-full uppercase tracking-wider border border-green-200">Partida em Aberto</span><h3 className="text-lg font-black text-[#1E1E1E] mt-1">Continuar Desafio Salvo?</h3><p className="text-xs text-gray-500">Progresso: <b>{savedSession.score} / {savedSession.totalInRegion}</b> • Região: <b>{REGIONS_LIST.find(r=>r.id===savedSession.region)?.name}</b></p></div></div>
            <div className="flex gap-2.5 w-full sm:w-auto"><button onClick={handleContinueSavedGame} className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-button font-black text-sm rounded-xl shadow-md transition">▶️ CONTINUAR</button><button onClick={clearSavedGame} className="px-4 py-3 bg-red-50 text-[#EE1515] font-button font-black text-xs rounded-xl border border-red-200">✕ Encerrar</button></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-3xl bg-[#FFFFFF] border-2 border-[#1B4F9C]/20 rounded-3xl shadow-2xl overflow-hidden font-card mt-2">
        <div className="bg-gradient-to-r from-[#1B4F9C] via-[#2A75BB] to-[#1B4F9C] px-6 py-4 flex items-center justify-between text-[#FFFFFF] shadow-md">
          <div className="flex items-center gap-2.5"><span className="text-2xl animate-spin-slow">🔴</span><h2 className="text-base sm:text-lg font-heading font-black tracking-wide uppercase">Central de Desafios</h2></div>
          <span className="text-xs font-stats font-bold bg-[#FFCB05] text-[#1B4F9C] px-3 py-1 rounded-full shadow-sm">CONFIGURAR GAME</span>
        </div>

        <div className="p-4 sm:p-8 space-y-7">
          
          {/* 1. CONFIGURAÇÃO DE COFRE */}
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] flex items-center gap-1.5"><span>💾</span> <span>1. Configurar partida:</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button onClick={() => setSessionSaveMode("NORMAL")} className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between shadow-sm ${sessionSaveMode === "NORMAL" ? "bg-[#2A75BB]/10 border-[#2A75BB] ring-2 ring-[#2A75BB]/20" : "bg-[#F5F5F5] border-[#D9D9D9] hover:bg-[#FFFFFF]"}`}><span className="text-base font-button font-black text-[#1E1E1E] flex items-center gap-2"><span>🎯</span> Partida Rápida</span><p className="text-xs text-[#1E1E1E]/60 mt-1 font-body">Partida normal sem progresso salvo.</p></button>
              <button onClick={() => setSessionSaveMode("SAVED")} className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between shadow-sm relative overflow-hidden ${sessionSaveMode === "SAVED" ? "bg-green-100/60 border-green-600 ring-2 ring-green-600/20" : "bg-[#F5F5F5] border-[#D9D9D9] hover:bg-[#FFFFFF]"}`}><span className="absolute top-0 right-0 bg-green-600 text-white font-stats font-black text-[9px] px-2 py-0.5 rounded-bl uppercase">PERSISTENTE ⭐</span><span className="text-base font-button font-black text-green-800 flex items-center gap-2"><span>💾</span> Partida Salva</span><p className="text-xs text-[#1E1E1E]/60 mt-1 font-body">Salva sua partida e permite continuar mais tarde!</p></button>
            </div>
          </div>

          {/* 2. MODO DE TREINAMENTO */}
          <div className="space-y-3 pt-3 border-t border-[#D9D9D9]/60">
            <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] flex items-center gap-1.5"><span>🕹️</span> <span>2. Modo de Jogo:</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={() => { setSelectedMode("NORMAL"); setIsMultiplayer(false); }} className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between shadow-sm ${selectedMode === "NORMAL" && !isMultiplayer ? "bg-[#2A75BB]/10 border-[#2A75BB] ring-2 ring-[#2A75BB]/20" : "bg-[#F5F5F5] border-[#D9D9D9] hover:bg-[#FFFFFF]"}`}><span className="text-base font-button font-black text-[#1E1E1E] flex items-center gap-1.5"><span>🎲</span> Modo Clássico</span><p className="text-xs text-[#1E1E1E]/60 mt-1.5 font-body">Modo normal de partida.</p></button>
              <button onClick={() => { setSelectedMode("ADVANCED"); setIsMultiplayer(false); }} className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between shadow-sm relative overflow-hidden ${selectedMode === "ADVANCED" && !isMultiplayer ? "bg-[#EE1515]/10 border-[#EE1515] ring-2 ring-[#EE1515]/20" : "bg-[#F5F5F5] border-[#D9D9D9] hover:bg-[#FFFFFF]"}`}><span className="absolute top-0 right-0 bg-[#FFCB05] text-[#1B4F9C] font-stats font-black text-[9px] px-2 py-0.5 rounded-bl uppercase">Aprender ⭐</span><span className="text-base font-button font-black text-[#EE1515] flex items-center gap-1.5"><span>🧠</span> Aprender</span><p className="text-xs text-[#1E1E1E]/60 mt-1.5 font-body">Modo para aprender a pokédex.</p></button>
              <button onClick={() => setIsMultiplayer(true)} className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between shadow-sm ${isMultiplayer ? "bg-purple-100 border-purple-600 ring-2 ring-purple-600/20" : "bg-[#F5F5F5] border-[#D9D9D9] hover:bg-[#FFFFFF]"}`}><span className="text-base font-button font-black text-purple-950 flex items-center gap-1.5"><span>⚔️</span> Modo Versus</span><p className="text-xs text-[#1E1E1E]/60 mt-1.5 font-body">Disputa de turnos em 1v1 ou 2v2!</p></button>
            </div>
            {isMultiplayer && (
              <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-300 space-y-3 animate-fade-in font-stats mt-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"><span className="text-xs font-black text-purple-900 uppercase">⚔️ Formato da Arena:</span><div className="flex gap-1.5 bg-white p-1 rounded-xl border border-purple-200"><button onClick={() => setMultiplayerType('FFA')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${multiplayerType === 'FFA' ? 'bg-purple-600 text-white shadow' : 'text-gray-600'}`}>1v1 (Até 10 Jogadores)</button><button onClick={() => setMultiplayerType('TEAMS')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${multiplayerType === 'TEAMS' ? 'bg-purple-600 text-white shadow' : 'text-gray-600'}`}>2v2 (Até 5 Duplas)</button></div></div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-700"><span>Quantidade de {multiplayerType === 'FFA' ? 'Treinadores' : 'Duplas'}: <b className="text-purple-900 text-sm">{playerCount}</b></span><input type="range" min="2" max={multiplayerType === 'FFA' ? 10 : 5} value={playerCount} onChange={(e) => setPlayerCount(Number(e.target.value))} className="w-40 sm:w-56 accent-purple-600 cursor-pointer" /></div>
              </div>
            )}
          </div>

          {/* 3. SELEÇÃO DE REGIÃO */}
          <div className="space-y-3 pt-3 border-t border-[#D9D9D9]/60">
            <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] flex items-center gap-1.5"><span>📍</span> <span>3. Escolha a Região (Deslize para os lados):</span></label>
            <div className="flex flex-row items-stretch gap-3 overflow-x-auto pb-3 pt-1 custom-scrollbar snap-x">
              {REGIONS_LIST.map((reg) => {
                const isSelected = selectedRegion === reg.id;
                return (
                  <button key={reg.id} onClick={() => setSelectedRegion(reg.id as Region)} className={`shrink-0 min-w-[150px] sm:min-w-[170px] snap-start relative group overflow-hidden rounded-2xl p-3.5 text-left transition flex flex-col justify-between border-2 ${isSelected ? `bg-gradient-to-br ${reg.badgeBg} text-[#FFFFFF] border-transparent shadow-lg scale-102 ring-2 ring-[#FFCB05]` : "bg-[#F5F5F5] text-[#1E1E1E] border-[#D9D9D9] hover:border-[#2A75BB] shadow-sm"}`}>
                    <div className="z-10 flex flex-col space-y-1 mb-6"><span className="text-sm font-button font-black leading-tight">{reg.name}</span><span className={`text-[10px] font-stats font-bold px-2 py-0.5 rounded w-fit ${isSelected ? "bg-black/30 text-[#FFCB05]" : "bg-[#D9D9D9]/70 text-[#1E1E1E]/80"}`}>{reg.total} PKMN</span></div>
                    <div className="absolute bottom-1 right-1 w-16 h-16 group-hover:scale-110 transition-transform"><Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${reg.mascotId}.png`} alt={reg.name} fill sizes="64px" className="object-contain drop-shadow-md" unoptimized /></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. FILTROS COM BOTÃO DE DIFICULDADE */}
          <div className="space-y-3 pt-3 border-t border-[#D9D9D9]/60">
            <div className="flex items-center justify-between"><label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] flex items-center gap-1.5"><span>🔥</span> <span>4. Escolher por tipo e Raridade:</span></label>{(selectedTypes.length > 0 || onlyLegendaries || onlyMythicals || onlyUltraBeasts || onlyParadox || onlyDifficult) && <button onClick={clearFilters} className="text-xs text-[#EE1515] font-button font-black hover:underline bg-red-50 px-2.5 py-1 rounded border border-red-200">Limpar ✕</button>}</div>
            
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setOnlyLegendaries(!onlyLegendaries)} className={`px-3.5 py-1.5 rounded-xl border text-xs font-button font-bold transition ${onlyLegendaries ? "bg-[#FFCB05] border-[#1E1E1E] font-black shadow" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70 hover:bg-white"}`}>👑 Lendários</button>
              <button onClick={() => setOnlyMythicals(!onlyMythicals)} className={`px-3.5 py-1.5 rounded-xl border text-xs font-button font-bold transition ${onlyMythicals ? "bg-purple-600 text-white font-black shadow" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70 hover:bg-white"}`}>✨ Míticos</button>
              <button onClick={() => setOnlyUltraBeasts(!onlyUltraBeasts)} className={`px-3.5 py-1.5 rounded-xl border text-xs font-button font-bold transition ${onlyUltraBeasts ? "bg-cyan-600 text-white font-black shadow" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70 hover:bg-white"}`}>🌌 Ultra Beasts</button>
              <button onClick={() => setOnlyParadox(!onlyParadox)} className={`px-3.5 py-1.5 rounded-xl border text-xs font-button font-bold transition ${onlyParadox ? "bg-rose-600 text-white font-black shadow" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70 hover:bg-white"}`}>⏳ Paradox</button>
              
              {/* ⭐ NOVO BOTÃO: JOGAR SÓ DIFICULDADES */}
              <button onClick={() => setOnlyDifficult(!onlyDifficult)} className={`px-3.5 py-1.5 rounded-xl border text-xs font-button font-bold transition relative overflow-hidden ${onlyDifficult ? "bg-red-600 text-white font-black shadow-md border-transparent" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70 hover:bg-white"}`}>
                ⚠️ Minhas Dificuldades
              </button>
            </div>
            
            <div className="flex flex-row items-center gap-2.5 overflow-x-auto pb-3 pt-1 custom-scrollbar snap-x">
              {TYPES_LIST.map((type) => {
                const isSelected = selectedTypes.includes(type.name);
                return (
                  <button key={type.name} onClick={() => toggleType(type.name)} className={`shrink-0 min-w-[120px] sm:min-w-[135px] snap-start p-2.5 rounded-2xl border-2 flex items-center justify-between gap-2 transition shadow-sm group ${isSelected ? `${type.bg} border-transparent text-white font-black scale-102 ring-2 ring-[#FFCB05]` : "bg-[#F5F5F5] border-[#D9D9D9] text-gray-700 hover:bg-white font-bold hover:border-gray-400"}`}>
                    <span className="text-xs font-button">{type.name}</span>
                    <div className="relative w-8 h-8 shrink-0 flex items-center justify-center rounded-full drop-shadow-sm group-hover:scale-110 transition-transform"><Image src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type.en}.svg`} alt={type.name} fill className="object-contain" unoptimized /></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. ESTILO E ORDEM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#D9D9D9]/60">
            <div className="space-y-2"><label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] block">🎨 5. Estilo do Pokémon:</label><div className="grid grid-cols-3 gap-2"><button onClick={() => setMediaStyle('IMAGE')} className={`py-3 px-2 rounded-xl border-2 text-xs font-button font-bold transition flex flex-col items-center justify-center gap-1 shadow-sm ${mediaStyle === 'IMAGE' ? "bg-[#1B4F9C] border-[#1B4F9C] text-white font-black" : "bg-[#F5F5F5] text-gray-700 hover:bg-white"}`}><span>🖼️</span> <span>Foto Normal</span></button><button onClick={() => setMediaStyle('SILHOUETTE')} className={`py-3 px-2 rounded-xl border-2 text-xs font-button font-bold transition flex flex-col items-center justify-center gap-1 shadow-sm ${mediaStyle === 'SILHOUETTE' ? "bg-purple-800 border-purple-600 text-white font-black" : "bg-[#F5F5F5] text-gray-700 hover:bg-white"}`}><span>👤</span> <span>Silhueta</span></button><button onClick={() => setMediaStyle('AUDIO')} className={`py-3 px-2 rounded-xl border-2 text-xs font-button font-bold transition flex flex-col items-center justify-center gap-1 shadow-sm ${mediaStyle === 'AUDIO' ? "bg-[#FFCB05] border-yellow-500 text-[#1B4F9C] font-black" : "bg-[#F5F5F5] text-gray-700 hover:bg-white"}`}><span>🔊</span> <span>Som (Grito)</span></button></div></div>
            <div className="space-y-2"><label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] block">🔀 Ordem do Pokémon:</label><div className="grid grid-cols-2 gap-2"><button onClick={() => setSelectedOrder("RANDOM")} className={`py-3.5 px-3 rounded-xl border-2 text-xs font-button font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${selectedOrder === "RANDOM" ? "bg-[#FFCB05] border-[#1B4F9C] text-[#1B4F9C] font-black" : "bg-[#F5F5F5] text-[#1E1E1E]/70 hover:bg-white"}`}><span>🎲</span> Aleatória</button><button onClick={() => setSelectedOrder("POKEDEX")} className={`py-3.5 px-3 rounded-xl border-2 text-xs font-button font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${selectedOrder === "POKEDEX" ? "bg-[#FFCB05] border-[#1B4F9C] text-[#1B4F9C] font-black" : "bg-[#F5F5F5] text-[#1E1E1E]/70 hover:bg-white"}`}><span>🔢</span> Numérica</button></div></div>
          </div>

          {/* 6. RESPOSTA */}
          <div className="space-y-2 pt-3 border-t border-[#D9D9D9]/60">
            <label className="text-xs sm:text-sm font-button font-extrabold uppercase tracking-wider text-[#1B4F9C] block">✍️ 6. Modo de Resposta:</label>
            <div className="grid grid-cols-2 gap-3"><button onClick={() => setSelectedAnswerMode("OPTIONS")} className={`py-3.5 px-4 rounded-xl border-2 text-xs sm:text-sm font-button font-bold transition flex items-center justify-center gap-2 shadow-sm ${selectedAnswerMode === "OPTIONS" ? "bg-[#1B4F9C] border-[#1B4F9C] text-white font-black" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70 hover:bg-white"}`}><span>🔘</span> <span>Alternativas</span></button><button onClick={() => setSelectedAnswerMode("TYPING")} className={`py-3.5 px-4 rounded-xl border-2 text-xs sm:text-sm font-button font-bold transition flex items-center justify-center gap-2 shadow-sm ${selectedAnswerMode === "TYPING" ? "bg-[#EE1515] border-[#EE1515] text-white font-black" : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E]/70 hover:bg-white"}`}><span>⌨️</span> <span>Digitar</span></button></div>
          </div>

          {/* 🚀 BOTÃO INICIAR */}
          <div className="pt-3">
            <button onClick={handleStartGame} disabled={isLoadingQueue} className={`w-full py-5 bg-gradient-to-r ${sessionSaveMode === 'SAVED' ? 'from-green-600 via-emerald-600 to-green-600' : 'from-[#EE1515] via-[#cc1010] to-[#EE1515]'} hover:from-[#ff1f1f] text-white font-button font-black text-lg sm:text-xl rounded-2xl shadow-xl flex items-center justify-center gap-3 border-2 border-[#FFCB05]/40 transition active:scale-99 ${isLoadingQueue ? "opacity-75 cursor-not-allowed" : ""}`}>
              {isLoadingQueue ? <span>GERANDO POKÉDEX...</span> : <><span>🚀</span><span>{isMultiplayer ? "INICIAR DISPUTA NA ARENA" : sessionSaveMode === 'SAVED' ? "INICIAR NOVO GAME SALVO" : "INICIAR PARTIDA RÁPIDA"}</span><span>⚡</span></>}
            </button>
          </div>

        </div>
      </div>

      {/* ❓ MODAL COMO JOGAR */}
      <AnimatePresence>
        {/* ... (mantido igual) ... */}
      </AnimatePresence>
    </main>
  );
}