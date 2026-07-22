// src/components/game/GameCompletionScreen.tsx
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
    isMultiplayer,
    players,
    restartCurrentGame,
  } = useGameStore();

  const { stats } = useLearningStore();
  const [fallbackEndTime] = useState(() => Date.now());

  const endTime = sessionEndTime > 0 ? sessionEndTime : fallbackEndTime;
  const timeDiffMs = Math.max(0, endTime - sessionStartTime);
  const totalSeconds = Math.floor(timeDiffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;

  const mistakes = Math.max(0, totalAnswered - score);
  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  // ⚔️ Ordena os jogadores por pontuação (Pódio Multijogador)
  const sortedPlayers = useMemo(() => {
    if (!isMultiplayer || !players.length) return [];
    return [...players].sort((a, b) => b.score - a.score);
  }, [isMultiplayer, players]);

  const hardestPokemon = useMemo(() => {
    const allStats = Object.values(stats || {});
    if (allStats.length === 0) return null;
    return allStats
      .filter((p) => p && (p.timesWrong > 0 || p.avgTimeMs > 5000))
      .sort((a, b) => b.timesWrong !== a.timesWrong ? b.timesWrong - a.timesWrong : b.avgTimeMs - a.avgTimeMs)[0] || null;
  }, [stats]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-3xl mx-auto w-full my-auto font-body animate-fade-in">
      <div className="w-full bg-[#FFFFFF] border-4 border-[#FFCB05] rounded-3xl shadow-2xl overflow-hidden font-card text-center relative">
        
        <div className="bg-gradient-to-r from-[#1B4F9C] via-[#2A75BB] to-[#1B4F9C] px-6 py-6 text-white shadow-md space-y-2">
          <span className="text-5xl sm:text-6xl inline-block animate-bounce drop-shadow-md">🏆</span>
          <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight uppercase text-[#FFCB05] drop-shadow">
            {isMultiplayer ? "Pódio dos Campeões!" : "Parabéns! Desafio Concluído!"}
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-md mx-auto font-medium">
            {isMultiplayer ? "A disputa acabou! Confira quem levou a medalha de ouro na arena!" : "Você provou o seu valor como Mestre da Pokédex!"}
          </p>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          
          {/* ⚔️ PÓDIO MULTIJOGADOR (SÓ APARECE EM DISPUTA) */}
          {isMultiplayer && sortedPlayers.length > 0 && (
            <div className="space-y-3 bg-purple-50 p-4 rounded-2xl border-2 border-purple-300 font-stats">
              <h3 className="text-sm font-black text-purple-900 uppercase tracking-wider">🥇 Ranking Final da Disputa:</h3>
              <div className="grid grid-cols-1 gap-2">
                {sortedPlayers.map((player, index) => {
                  const medal = index === 0 ? "🥇 1º" : index === 1 ? "🥈 2º" : index === 2 ? "🥉 3º" : `${index + 1}º`;
                  const bg = index === 0 ? "bg-amber-100 border-amber-400 text-amber-950 font-black scale-102 shadow" : "bg-white border-gray-200 text-gray-700 font-bold";
                  return (
                    <div key={player.id} className={`flex items-center justify-between p-3 rounded-xl border ${bg}`}>
                      <span className="text-sm">{medal} - <b>{player.name}</b></span>
                      <span className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-black">{player.score} Acertos</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <h2 className="text-xs sm:text-sm font-button font-black text-[#1B4F9C] uppercase tracking-wider">
            📊 Relatório da Partida:
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 font-stats">
            <div className="bg-[#F5F5F5] p-3.5 rounded-2xl border border-[#D9D9D9] flex flex-col items-center justify-center"><span className="text-[10px] uppercase font-bold text-[#1E1E1E]/50">Total</span><span className="text-xl sm:text-2xl font-black text-[#1B4F9C] mt-0.5">{totalInRegion}</span></div>
            <div className="bg-green-50 p-3.5 rounded-2xl border border-green-300 flex flex-col items-center justify-center"><span className="text-[10px] uppercase font-bold text-green-700">Acertos</span><span className="text-xl sm:text-2xl font-black text-green-600 mt-0.5">✅ {score}</span></div>
            <div className="bg-red-50 p-3.5 rounded-2xl border border-red-300 flex flex-col items-center justify-center"><span className="text-[10px] uppercase font-bold text-red-700">Erros</span><span className="text-xl sm:text-2xl font-black text-[#EE1515] mt-0.5">❌ {mistakes}</span></div>
            <div className="bg-[#FFCB05]/15 p-3.5 rounded-2xl border border-[#FFCB05] flex flex-col items-center justify-center"><span className="text-[10px] uppercase font-bold text-[#1B4F9C]">Precisão</span><span className="text-xl sm:text-2xl font-black text-[#1B4F9C] mt-0.5">🎯 {accuracy}%</span></div>
            <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-300 flex flex-col items-center justify-center"><span className="text-[10px] uppercase font-bold text-purple-700">Tempo</span><span className="text-lg sm:text-xl font-black text-purple-900 mt-0.5">⏱️ {formattedTime}</span></div>
            <div className="bg-orange-50 p-3.5 rounded-2xl border border-orange-300 flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-orange-700">Difícil</span>
              {hardestPokemon ? (
                <div className="flex items-center gap-1.5 mt-0.5"><div className="relative w-7 h-7"><Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${hardestPokemon.id}.png`} alt="Hardest" fill sizes="28px" className="object-contain" unoptimized /></div><span className="text-xs sm:text-sm font-black text-orange-950 truncate max-w-[70px]">#{hardestPokemon.id}</span></div>
              ) : <span className="text-xs font-black text-emerald-700 mt-1">Nenhum! 🌟</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#D9D9D9]/60 font-button">
            <button onClick={restartCurrentGame} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 text-white font-black text-sm sm:text-base rounded-2xl shadow transition flex items-center justify-center gap-2"><span>🔄</span> <span>Jogar Novamente</span></button>
            <Link href="/review" className="w-full py-4 bg-[#FFCB05] hover:bg-[#ffbe00] text-[#1B4F9C] font-black text-sm sm:text-base rounded-2xl shadow transition flex items-center justify-center gap-2"><span>📚</span> <span>Revisão ({mistakes} erros)</span></Link>
            <Link href="/" className="w-full py-3.5 bg-[#1B4F9C] hover:bg-[#153e7a] text-white font-black text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2"><span>🕹️</span> <span>Menu Principal</span></Link>
            <Link href="/" className="w-full py-3.5 bg-[#F5F5F5] hover:bg-gray-200 text-[#1E1E1E]/80 font-bold text-xs sm:text-sm rounded-xl border transition flex items-center justify-center gap-2"><span>🏠</span> <span>Sair</span></Link>
          </div>

        </div>
      </div>
    </main>
  );
}