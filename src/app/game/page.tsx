"use client";

import { useEffect } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useGameStore } from "@/store/useGameStore";
import { fetchPokemonDetails, fetchPokemonOption } from "@/queries/pokeApi";
import PokemonDisplay from "@/components/game/PokemonDisplay";
import OptionButton from "@/components/game/OptionButton";
import PokemonInfoCard from "@/components/game/PokemonInfoCard";
import Link from "next/link";

export default function GamePage() {
  const {
    status,
    currentCorrectId,
    currentOptionIds,
    selectedOptionId,
    score,
    totalAnswered,
    streak,
    totalInRegion,
    remainingIds,
    isSilhouetteMode,
    toggleSilhouetteMode,
    startGame,
    answerQuestion,
    nextQuestion,
  } = useGameStore();

  useEffect(() => {
    if (status === "IDLE") {
      startGame("ALL", "RANDOM", false);
    }
  }, [status, startGame]);

  const { data: correctPokemon, isLoading: isCorrectLoading } = useQuery({
    queryKey: ["pokemonDetails", currentCorrectId],
    queryFn: () => fetchPokemonDetails(currentCorrectId!),
    enabled: currentCorrectId !== null,
  });

  const optionsQueries = useQueries({
    queries: currentOptionIds.map((id) => ({
      queryKey: ["pokemonOption", id],
      queryFn: () => fetchPokemonOption(id),
      enabled: currentOptionIds.length > 0,
    })),
  });

  const isOptionsLoading = optionsQueries.some((q) => q.isLoading);
  const isLoading = isCorrectLoading || isOptionsLoading;
  const isRevealed = status === "ANSWERED";
  const isCorrectAnswer = selectedOptionId === correctPokemon?.id;

  if (isLoading || !correctPokemon) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F5] text-[#1E1E1E] space-y-3 p-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#EE1515] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#1E1E1E]/70 text-xs sm:text-base font-bold animate-pulse text-center">
          Procurando Pokémon selvagem...
        </p>
      </div>
    );
  }

  if (status === "FINISHED") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F5] text-[#1E1E1E] p-6 text-center space-y-5">
        <h1 className="text-3xl sm:text-4xl font-black text-[#1B4F9C]">🎉 Região Concluída!</h1>
        <p className="text-[#1E1E1E]/80 max-w-md text-sm sm:text-base font-medium">
          Você identificou todos os Pokémon selecionados! Sua pontuação final foi de{" "}
          <span className="font-bold text-[#2A75BB]">{score}</span> em{" "}
          <span className="font-bold text-[#1E1E1E]">{totalAnswered}</span>.
        </p>
        <button
          onClick={() => startGame("ALL", "RANDOM", isSilhouetteMode)}
          className="px-6 py-3.5 bg-[#EE1515] hover:bg-[#cc1010] text-[#FFFFFF] font-black rounded-xl transition shadow-lg shadow-[#EE1515]/30 text-sm sm:text-base w-full max-w-xs"
        >
          Jogar Novamente
        </button>
      </div>
    );
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-2 sm:p-6 md:p-8 transition-colors duration-500 ${
        !isRevealed
          ? "bg-[#F5F5F5]"
          : isCorrectAnswer
          ? "bg-gradient-to-b from-[#F5F5F5] via-green-100 to-[#F5F5F5]"
          : "bg-gradient-to-b from-[#F5F5F5] via-red-100 to-[#F5F5F5]"
      } text-[#1E1E1E]`}
    >
      {/* Barra Superior Adaptativa */}
      <header className="w-full max-w-4xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 bg-[#FFFFFF] border border-[#D9D9D9] px-3 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl z-10 shrink-0 shadow-sm font-navbar">
        <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="text-xs sm:text-sm font-bold text-[#1B4F9C] hover:text-[#EE1515] transition px-2 py-1 rounded-lg bg-[#F5F5F5] border border-[#D9D9D9] font-button"
          >
            ← Sair
          </Link>

          <button
            onClick={toggleSilhouetteMode}
            className={`text-[11px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border font-bold transition flex items-center gap-1 font-button ${
              isSilhouetteMode
                ? "bg-[#1B4F9C] border-[#1B4F9C] text-[#FFFFFF]"
                : "bg-[#F5F5F5] border-[#D9D9D9] text-[#1E1E1E] hover:bg-[#FFFFFF]"
            }`}
          >
            <span>{isSilhouetteMode ? "👤 Silhueta: ON" : "🖼️ Foto Normal"}</span>
          </button>
        </div>

        {/* NÚMEROS COM A FONTE ORBITRON (font-stats)! */}
        <div className="flex items-center justify-around sm:justify-end gap-2 sm:gap-6 text-xs sm:text-sm font-semibold border-t border-[#D9D9D9] sm:border-t-0 pt-2 sm:pt-0">
          <div className="bg-[#F5F5F5] sm:bg-transparent px-2 py-0.5 rounded-md">
            Acertos: <span className="text-[#2A75BB] font-stats font-bold text-sm sm:text-base">{score}</span>/<span className="font-stats">{totalAnswered}</span>
          </div>
          <div className="text-[#D9D9D9] hidden sm:block">|</div>
          <div className="bg-[#F5F5F5] sm:bg-transparent px-2 py-0.5 rounded-md">
            Streak: <span className="text-[#EE1515] font-stats font-bold text-sm sm:text-base">{streak}</span>🔥
          </div>
          <div className="text-[#D9D9D9] hidden sm:block">|</div>
          <div className="bg-[#F5F5F5] sm:bg-transparent px-2 py-0.5 rounded-md">
            Faltam: <span className="text-[#1E1E1E] font-stats font-bold text-sm sm:text-base">{remainingIds.length}</span>/<span className="font-stats">{totalInRegion}</span>
          </div>
        </div>
      </header>

      {/* Imagem do Pokémon */}
      <section className="flex-1 flex flex-col items-center justify-center w-full z-10 my-auto">
        <PokemonDisplay
          imageUrl={correctPokemon.artworkUrl}
          name={correctPokemon.name}
          isRevealed={isRevealed}
          isSilhouetteMode={isSilhouetteMode}
        />
      </section>

      {/* Botões ou Ficha Informativa */}
      <section className="w-full max-w-xl flex flex-col items-center pb-2 sm:pb-6 z-10 shrink-0">
        {!isRevealed ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
            {optionsQueries.map((query) => {
              const option = query.data;
              if (!option) return null;

              return (
                <OptionButton
                  key={option.id}
                  name={option.name}
                  isSelected={selectedOptionId === option.id}
                  isCorrect={option.id === correctPokemon.id}
                  isRevealed={isRevealed}
                  disabled={isRevealed}
                  onClick={() => answerQuestion(option.id)}
                />
              );
            })}
          </div>
        ) : (
          <PokemonInfoCard
            details={correctPokemon}
            onNext={nextQuestion}
            isCorrect={isCorrectAnswer}
          />
        )}
      </section>
    </main>
  );
}