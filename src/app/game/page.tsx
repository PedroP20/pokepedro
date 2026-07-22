// src/app/game/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useGameStore } from "@/store/useGameStore";
import { useLearningStore } from "@/store/useLearningStore";
import { fetchPokemonDetails, fetchPokemonOption } from "@/queries/pokeApi";
import PokemonDisplay from "@/components/game/PokemonDisplay";
import AudioChallengeDisplay from "@/components/game/AudioChallengeDisplay";
import OptionButton from "@/components/game/OptionButton";
import PokemonInfoCard from "@/components/game/PokemonInfoCard";
import GameCompletionScreen from "@/components/game/GameCompletionScreen";
import Link from "next/link";
import Image from "next/image";

export default function GamePage() {
  const {
    status, gameMode, answerMode, mediaStyle, currentCorrectId, currentOptionIds,
    selectedOptionId, isPartialMatch, score, totalAnswered, streak, isSilhouetteMode,
    toggleSilhouetteMode, answerQuestion, answerByTyping, nextQuestion,
    isMultiplayer, players, currentPlayerIndex, learningPhase
  } = useGameStore();

  const [showComparison, setShowComparison] = useState(false);
  const [typedInput, setTypedInput] = useState("");

  const { data: correctPokemon, isLoading: isLoadingCorrect } = useQuery({
    queryKey: ["pokemon", currentCorrectId], queryFn: () => fetchPokemonDetails(currentCorrectId!),
    enabled: currentCorrectId !== null && status !== "FINISHED",
  });

  const optionsQueries = useQueries({
    queries: currentOptionIds.map((id) => ({
      queryKey: ["pokemon-option", id], queryFn: () => fetchPokemonOption(id),
      enabled: id !== undefined && id !== null && status !== "FINISHED",
    })),
  });

  const isMarkedDifficult = useLearningStore((state) => currentCorrectId ? state.stats[currentCorrectId]?.isMarkedDifficult : false);
  const toggleDifficultyMark = useLearningStore((state) => state.toggleDifficultyMark);

  if (status === "FINISHED") return <GameCompletionScreen />;

  // ⭐ CONTROLE DA FASE 1: Força a revelação automática para o usuário ler!
  const isLearningReveal = gameMode === 'ADVANCED' && learningPhase === 1;
  const isRevealed = selectedOptionId !== null || isLearningReveal;
  
  // Força como 'correto' na fase 1 para não mostrar tela de erro
  const isCorrectAnswer = isLearningReveal || selectedOptionId === currentCorrectId || (answerMode === 'TYPING' && selectedOptionId !== null && selectedOptionId > 0);

  const handleOptionClick = (id: number) => {
    if (isRevealed) return;
    answerQuestion(id);
    if (id !== currentCorrectId) setShowComparison(true);
  };

  const handleTypingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealed || !typedInput.trim() || !correctPokemon) return;
    answerByTyping(typedInput, correctPokemon.name);
    if (selectedOptionId === -1) setShowComparison(true);
  };

  const handleNext = () => {
    setShowComparison(false);
    setTypedInput("");
    nextQuestion();
  };

  const guessedOption = optionsQueries.map((q) => q.data).find((o) => o && o.id === selectedOptionId) as { id: number; name: string } | undefined;
  const currentPlayer = players[currentPlayerIndex];

  if (status === "IDLE" || currentCorrectId === null || isLoadingCorrect || !correctPokemon) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 font-body my-auto">
        <div className="w-12 h-12 border-4 border-[#1B4F9C] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-button font-bold text-[#1B4F9C] uppercase tracking-wider animate-pulse">Carregando Pokédex...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full my-auto font-body space-y-4">
      
      {isMultiplayer && currentPlayer && (
        <div className="w-full bg-gradient-to-r from-purple-800 to-indigo-900 text-white px-5 py-3 rounded-2xl shadow-md flex items-center justify-between font-stats animate-fade-in border-2 border-purple-400">
          <span className="text-xs uppercase font-bold tracking-widest text-purple-200">🎮 Rodada em Andamento:</span>
          <span className="text-base sm:text-lg font-black text-[#FFCB05] drop-shadow">VEZ DE: {currentPlayer.name}</span>
          <span className="px-3 py-1 bg-purple-600 rounded-lg text-xs font-black">{currentPlayer.score} Pts</span>
        </div>
      )}

      {/* BARRA SUPERIOR DE STATUS */}
      <header className="w-full flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-[#D9D9D9] shadow-sm font-stats">
        <div className="flex items-center gap-4">
          <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-[#1E1E1E]/50">Placar</span><span className="text-base font-black text-[#1B4F9C]">{score} / {totalAnswered}</span></div>
          <div className="h-6 w-[1px] bg-[#D9D9D9]" />
          <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-[#1E1E1E]/50">Ofensiva</span><span className="text-base font-black text-[#FFCB05] drop-shadow-sm">🔥 {streak}</span></div>
        </div>

        <div className="flex items-center gap-2">
          {!isMultiplayer && currentCorrectId !== null && (
            <button onClick={() => toggleDifficultyMark(currentCorrectId)} className={`p-2 px-3 rounded-xl border text-xs font-black transition shadow-sm flex items-center gap-1.5 ${isMarkedDifficult ? 'bg-red-100 border-red-500 text-red-700' : 'bg-[#F5F5F5] hover:bg-gray-200 border-gray-300 text-gray-600'}`} title="Marcar como Dificuldade">
              {isMarkedDifficult ? "⚠️ Difícil" : "🚩 Marcar"}
            </button>
          )}

          {mediaStyle !== 'AUDIO' && gameMode !== 'ADVANCED' && (
            <button onClick={toggleSilhouetteMode} className="p-2 rounded-xl bg-[#F5F5F5] hover:bg-white border text-xs font-bold transition shadow-sm">
              {isSilhouetteMode ? "👤 Silhueta ON" : "🖼️ Normal"}
            </button>
          )}
          <Link href="/" className="px-3 py-1.5 rounded-xl bg-red-50 text-[#EE1515] hover:bg-red-100 border border-red-200 font-button font-bold text-xs transition">Sair ✕</Link>
        </div>
      </header>

      {/* ⭐ BANNERS DAS 3 ETAPAS DE APRENDIZADO */}
      {gameMode === 'ADVANCED' && (
        <div className="w-full max-w-xl animate-fade-in">
          {learningPhase === 1 && <div className="bg-[#FFCB05] text-[#1B4F9C] font-black text-center py-2 px-4 rounded-xl text-sm shadow-sm border border-yellow-500">🧠 FASE 1: Memorize o nome deste Pokémon!</div>}
          {learningPhase === 2 && !isRevealed && <div className="bg-blue-100 text-[#1B4F9C] font-black text-center py-2 px-4 rounded-xl text-sm shadow-sm border border-blue-200">🔍 FASE 2: Qual era o nome dele mesmo?</div>}
          {learningPhase === 3 && !isRevealed && <div className="bg-red-100 text-[#EE1515] font-black text-center py-2 px-4 rounded-xl text-sm shadow-sm border border-red-200">⌨️ FASE 3: Digite o nome sem ver as opções!</div>}
        </div>
      )}

      {/* EXIBIÇÃO VISUAL OU DE ÁUDIO */}
      <section className="flex-1 flex flex-col items-center justify-center w-full min-h-[200px] sm:min-h-[260px]">
        {mediaStyle === 'AUDIO' ? (
          <AudioChallengeDisplay id={correctPokemon.id} name={correctPokemon.name} isRevealed={isRevealed} imageUrl={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${correctPokemon.id}.png`} />
        ) : (
          <PokemonDisplay id={correctPokemon.id} imageUrl={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${correctPokemon.id}.png`} name={correctPokemon.name} isRevealed={isRevealed} isSilhouetteMode={isSilhouetteMode} />
        )}
      </section>

      {/* ÁREA DE RESPOSTAS */}
      <section className="w-full max-w-xl flex flex-col items-center pb-2 sm:pb-4 z-10 shrink-0">
        {!isRevealed ? (
          answerMode === 'OPTIONS' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
              {optionsQueries.map((query) => {
                const option = query.data as { id: number; name: string } | undefined;
                if (!option) return null;
                return <OptionButton key={option.id} name={option.name} isSelected={selectedOptionId === option.id} isCorrect={option.id === correctPokemon.id} isRevealed={isRevealed} disabled={isRevealed} onClick={() => handleOptionClick(option.id)} />;
              })}
            </div>
          ) : (
            <form onSubmit={handleTypingSubmit} className="w-full flex flex-col sm:flex-row gap-2">
              <input type="text" autoFocus placeholder="Digite o nome..." value={typedInput} onChange={(e) => setTypedInput(e.target.value)} className="flex-1 px-5 py-4 rounded-2xl border-2 border-[#1B4F9C] bg-white text-[#1E1E1E] font-heading font-black text-lg focus:outline-none focus:ring-4 focus:ring-[#FFCB05]/40 shadow-sm" />
              <button type="submit" disabled={!typedInput.trim()} className="px-8 py-4 bg-[#1B4F9C] hover:bg-[#153e7a] disabled:bg-gray-300 text-white font-button font-black text-base rounded-2xl shadow-lg transition active:scale-98">Responder ↵</button>
            </form>
          )
        ) : !isCorrectAnswer && showComparison ? (
          <div className="w-full bg-white border-2 border-red-500/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col items-center space-y-5 animate-fade-in font-card">
            <div className="text-center space-y-1"><span className="px-3 py-1 bg-red-100 text-[#EE1515] font-button font-black text-[11px] rounded-full uppercase tracking-wider border border-red-200">⚠️ Erro (Ele voltará depois)</span><h3 className="text-xl sm:text-2xl font-heading font-black text-[#1E1E1E]">Compare as Diferenças!</h3></div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
              <div className="flex flex-col items-center p-3 sm:p-4 bg-red-50/70 border-2 border-red-500 rounded-2xl text-center"><span className="text-[11px] font-black text-[#EE1515] mb-1.5">❌ Sua resposta:</span>{answerMode === 'OPTIONS' ? (<><div className="relative w-24 h-24 sm:w-32 sm:h-32"><Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedOptionId}.png`} alt="Erro" fill sizes="128px" className="object-contain" unoptimized /></div><span className="font-heading font-black text-xs sm:text-sm capitalize mt-2 truncate w-full">{guessedOption?.name || `#${selectedOptionId}`}</span></>) : <div className="h-24 sm:h-32 flex items-center justify-center"><span className="text-lg sm:text-2xl font-black text-red-600 underline uppercase">{typedInput}</span></div>}</div>
              <div className="flex flex-col items-center p-3 sm:p-4 bg-green-50/70 border-2 border-green-500 rounded-2xl text-center"><span className="text-[11px] font-black text-green-700 mb-1.5">✅ O correto era:</span><div className="relative w-24 h-24 sm:w-32 sm:h-32"><Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentCorrectId}.png`} alt="Certo" fill sizes="128px" className="object-contain" unoptimized /></div><span className="font-heading font-black text-xs sm:text-sm capitalize mt-2 truncate w-full">{correctPokemon.name}</span></div>
            </div>
            <button onClick={() => setShowComparison(false)} className="w-full py-3.5 bg-[#1B4F9C] hover:bg-[#153e7a] text-white font-button font-black rounded-xl shadow transition text-sm">Entendi! Ver Ficha Completa ❯</button>
          </div>
        ) : (
          <PokemonInfoCard details={correctPokemon} onNext={handleNext} isCorrect={isCorrectAnswer} />
        )}
      </section>
    </main>
  );
}