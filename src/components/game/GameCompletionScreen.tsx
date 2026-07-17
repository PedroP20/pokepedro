"use client";

import { useMemo, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useLearningStore } from "@/store/useLearningStore";
import Link from "next/link";
import Image from "next/image";

export default function GameCompletionScreen() {
  const {
    score = 0,
    totalAnswered = 0,
    totalInRegion = 0,
    sessionStartTime = 0,
    sessionEndTime = 0,
    gameMode,
    restartCurrentGame,
  } = useGameStore();

  const { stats } = useLearningStore();

  // 🛡️ BLINDAGEM REACT COMPILER: Captura o tempo no momento exato em que a tela monta (100% puro)
  const [fallbackEndTime] = useState(() => Date.now());

  // 1. Cálculo de Tempo Total Formatado (mm:ss)
  const endTime = sessionEndTime > 0 ? sessionEndTime : fallbackEndTime;
  const timeDiffMs = Math.max(0, endTime - sessionStartTime);
  const totalSeconds = Math.floor(timeDiffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;

  // 2. Erros e Taxa de Acerto (%)
  const mistakes = Math.max(0, totalAnswered - score);
  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  // 3. Identifica o Pokémon com maior dificuldade (mais erros ou maior tempo)
  const hardestPokemon = useMemo(() => {
    const allStats = Object.values(stats || {});
    if (allStats.length === 0) return null;
    
    const sorted = allStats
      .filter((p) => p && (p.timesWrong > 0 || p.avgTimeMs > 5000))
      .sort((a, b) => {
        if (b.timesWrong !== a.timesWrong) return b.timesWrong - a.timesWrong;
        return b.avgTimeMs - a.avgTimeMs;
      });
      
    return sorted[0] || null;
  }, [stats]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-3xl mx-auto w-full my-auto font-body animate-fade-in">
      
      {/* 🎮 CARD DE TROFÉU ESTILO FLIPERAMA */}
      <div className="w-full bg-[#FFFFFF] border-4 border-[#FFCB05] rounded-3xl shadow-2xl overflow-hidden font-card text-center relative">
        
        {/* Topo Festivo */}
        <div className="bg-gradient-to-r from-[#1B4F9C] via-[#2A75BB] to-[#1B4F9C] px-6 py-6 text-white shadow-md space-y-2 relative">
          <span className="text-5xl sm:text-6xl inline-block animate-bounce drop-shadow-md">🏆</span>
          <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight uppercase text-[#FFCB05] drop-shadow">
            Parabéns! Desafio Concluído!
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-md mx-auto font-medium">
            Você provou o seu valor como Mestre da Pokédex e completou 100% dos Pokémon desta seleção!
          </p>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-stats font-black uppercase tracking-widest mt-1">
            {gameMode === 'ADVANCED' ? "🧠 Treino SRS Finalizado" : "🕹️ Modo Clássico Finalizado"}
          </span>
        </div>

        {/* Corpo com Estatísticas */}
        <div className="p-5 sm:p-8 space-y-6">
          <h2 className="text-xs sm:text-sm font-button font-black text-[#1B4F9C] uppercase tracking-wider">
            📊 Relatório Oficial da Partida:
          </h2>

          {/* GRID DE 6 ESTATÍSTICAS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 font-stats">
            
            {/* 1. Total da Partida */}
            <div className="bg-[#F5F5F5] p-3.5 rounded-2xl border border-[#D9D9D9] flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-[#1E1E1E]/50">Total de Pokémon</span>
              <span className="text-xl sm:text-2xl font-black text-[#1B4F9C] mt-0.5">{totalInRegion}</span>
            </div>

            {/* 2. Acertos */}
            <div className="bg-green-50 p-3.5 rounded-2xl border border-green-300 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-green-700">Acertos</span>
              <span className="text-xl sm:text-2xl font-black text-green-600 mt-0.5">✅ {score}</span>
            </div>

            {/* 3. Erros */}
            <div className="bg-red-50 p-3.5 rounded-2xl border border-red-300 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-red-700">Erros</span>
              <span className="text-xl sm:text-2xl font-black text-[#EE1515] mt-0.5">❌ {mistakes}</span>
            </div>

            {/* 4. Taxa de Acerto (%) */}
            <div className="bg-[#FFCB05]/15 p-3.5 rounded-2xl border border-[#FFCB05] flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-[#1B4F9C]">Taxa de Acerto</span>
              <span className="text-xl sm:text-2xl font-black text-[#1B4F9C] mt-0.5">🎯 {accuracy}%</span>
            </div>

            {/* 5. Tempo da Sessão */}
            <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-300 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-purple-700">Tempo Total</span>
              <span className="text-lg sm:text-xl font-black text-purple-900 mt-0.5">⏱️ {formattedTime}</span>
            </div>

            {/* 6. Maior Dificuldade */}
            <div className="bg-orange-50 p-3.5 rounded-2xl border border-orange-300 flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-orange-700">Maior Dificuldade</span>
              {hardestPokemon ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="relative w-7 h-7">
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${hardestPokemon.id}.png`}
                      alt="Hardest"
                      fill
                      sizes="28px"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-black text-orange-950 truncate max-w-[70px]">
                    #{hardestPokemon.id} ({hardestPokemon.timesWrong}x)
                  </span>
                </div>
              ) : (
                <span className="text-xs font-black text-emerald-700 mt-1">Nenhum! 🌟</span>
              )}
            </div>

          </div>

          {/* 🔘 BOTÕES DE COMANDO DO ARCADE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#D9D9D9]/60 font-button">
            
            {/* 1. Jogar Novamente (Mesmas Configs) */}
            <button
              onClick={restartCurrentGame}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg transition flex items-center justify-center gap-2 border-2 border-white/20"
            >
              <span>🔄</span> <span>Jogar Novamente</span>
            </button>

            {/* 2. Ir para Revisão */}
            <Link
              href="/review"
              className="w-full py-4 bg-[#FFCB05] hover:bg-[#ffbe00] active:scale-98 text-[#1B4F9C] font-black text-sm sm:text-base rounded-2xl shadow-lg transition flex items-center justify-center gap-2 border-2 border-[#1B4F9C]/20"
            >
              <span>📚</span> <span>Ir para Revisão ({mistakes} erros)</span>
            </Link>

            {/* 3. Alterar Filtros / Modo */}
            <Link
              href="/"
              className="w-full py-3.5 bg-[#1B4F9C] hover:bg-[#153e7a] text-white font-black text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>🕹️</span> <span>Alterar Filtros e Modos</span>
            </Link>

            {/* 4. Menu Principal */}
            <Link
              href="/"
              className="w-full py-3.5 bg-[#F5F5F5] hover:bg-gray-200 text-[#1E1E1E]/80 font-bold text-xs sm:text-sm rounded-xl border border-[#D9D9D9] transition flex items-center justify-center gap-2"
            >
              <span>🏠</span> <span>Voltar ao Menu Principal</span>
            </Link>

          </div>

        </div>
      </div>

    </main>
  );
}