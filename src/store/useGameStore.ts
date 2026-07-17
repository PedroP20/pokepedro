// src/store/useGameStore.ts
import { create } from "zustand";
import { Region, OrderType, GameStatus, REGION_RANGES } from "@/types/pokemon";
import { useLearningStore } from "./useLearningStore";
import { checkTypingMatch } from "@/lib/stringUtils";

export type GameMode = 'NORMAL' | 'ADVANCED';
export type AnswerMode = 'OPTIONS' | 'TYPING';

export interface GameState {
  status: GameStatus;
  gameMode: GameMode;
  answerMode: AnswerMode;
  region: Region;
  order: OrderType;
  isSilhouetteMode: boolean;
  
  currentCorrectId: number | null;
  currentOptionIds: number[];
  selectedOptionId: number | null;
  isPartialMatch: boolean;
  
  score: number;
  totalAnswered: number;
  streak: number;
  totalInRegion: number;
  remainingIds: number[];
  
  currentStartTime: number;
  sessionStartTime: number;
  sessionEndTime: number;

  lastGameConfig: {
    region: Region;
    order: OrderType;
    isSilhouetteMode: boolean;
    mode: GameMode;
    answerMode: AnswerMode;
    customIds?: number[];
  } | null;

  startGame: (region: Region, order: OrderType, isSilhouetteMode: boolean, mode?: GameMode, answerMode?: AnswerMode, customIds?: number[]) => void;
  answerQuestion: (selectedId: number) => void;
  answerByTyping: (typedText: string, correctName: string) => void;
  nextQuestion: () => void;
  toggleSilhouetteMode: () => void;
  restartCurrentGame: () => void;
  resetGame: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 🛡️ GERADOR BLINDADO ANTI-LOOP INFINITO
function generateOptions(correctId: number, allPossibleIds: number[]): number[] {
  const options = [correctId];
  
  // Se a lista filtrada tiver menos de 4 Pokémon (Ex: Míticos de Kanto só tem o Mew),
  // nós usamos a Pokedéx inteira (1 a 1025) como reserva para gerar os botões errados!
  let poolToPickFrom = allPossibleIds;
  if (new Set(allPossibleIds).size < 4) {
    poolToPickFrom = Array.from({ length: 1025 }, (_, i) => i + 1);
  }

  // Disjuntor de segurança: garante que o laço NUNCA rode infinitamente
  let safetyCounter = 0;
  while (options.length < 4 && safetyCounter < 1000) {
    safetyCounter++;
    const randomId = poolToPickFrom[Math.floor(Math.random() * poolToPickFrom.length)];
    if (!options.includes(randomId)) {
      options.push(randomId);
    }
  }

  return shuffleArray(options);
}

export const useGameStore = create<GameState>((set, get) => ({
  status: "IDLE",
  gameMode: 'NORMAL',
  answerMode: 'OPTIONS',
  region: "ALL",
  order: "RANDOM",
  isSilhouetteMode: false,
  currentCorrectId: null,
  currentOptionIds: [],
  selectedOptionId: null,
  isPartialMatch: false,
  score: 0,
  totalAnswered: 0,
  streak: 0,
  totalInRegion: 0,
  remainingIds: [],
  currentStartTime: 0,
  sessionStartTime: 0,
  sessionEndTime: 0,
  lastGameConfig: null,

  startGame: (region, order, isSilhouetteMode, mode = 'NORMAL', answerMode = 'OPTIONS', customIds) => {
    let idsToPlay: number[] = [];
    if (customIds && customIds.length > 0) {
      idsToPlay = [...customIds];
    } else {
      const [min, max] = REGION_RANGES[region] || [1, 1025];
      idsToPlay = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }

    const totalInRegion = idsToPlay.length;

    if (order === "RANDOM") {
      idsToPlay = shuffleArray(idsToPlay);
    } else {
      idsToPlay.sort((a, b) => a - b);
    }

    const firstCorrectId = idsToPlay[0];
    const remaining = idsToPlay.slice(1);
    
    // Passamos a lista blindada para gerar os botões com segurança
    const options = generateOptions(firstCorrectId, idsToPlay);
    const now = Date.now();

    set({
      status: "PLAYING",
      gameMode: mode,
      answerMode,
      region,
      order,
      isSilhouetteMode,
      currentCorrectId: firstCorrectId,
      currentOptionIds: options,
      selectedOptionId: null,
      isPartialMatch: false,
      score: 0,
      totalAnswered: 0,
      streak: 0,
      totalInRegion,
      remainingIds: remaining,
      currentStartTime: now,
      sessionStartTime: now,
      sessionEndTime: 0,
      lastGameConfig: { region, order, isSilhouetteMode, mode, answerMode, customIds },
    });
  },

  answerQuestion: (selectedId) => {
    const state = get();
    if (state.status === "FINISHED" || state.selectedOptionId !== null || state.currentCorrectId === null) return;

    const isCorrect = selectedId === state.currentCorrectId;
    const timeTaken = Date.now() - (state.currentStartTime || Date.now());

    try {
      useLearningStore.getState().recordAnswer(state.currentCorrectId, isCorrect, timeTaken);
    } catch (error) {
      console.error("Erro silencioso LearningStore:", error);
    }

    const currentRemaining = Array.isArray(state.remainingIds) ? state.remainingIds : [];
    const newRemaining = [...currentRemaining];

    if (!isCorrect && state.gameMode === 'ADVANCED') {
      const insertIndex = Math.min(3, newRemaining.length);
      newRemaining.splice(insertIndex, 0, state.currentCorrectId);
    } else if (isCorrect && state.gameMode === 'ADVANCED' && timeTaken > 6000) {
      const insertIndex = Math.min(8, newRemaining.length);
      newRemaining.splice(insertIndex, 0, state.currentCorrectId);
    }

    set({
      selectedOptionId: selectedId,
      isPartialMatch: false,
      score: isCorrect ? (state.score || 0) + 1 : (state.score || 0),
      totalAnswered: (state.totalAnswered || 0) + 1,
      streak: isCorrect ? (state.streak || 0) + 1 : 0,
      remainingIds: newRemaining,
    });
  },

  answerByTyping: (typedText, correctName) => {
    const state = get();
    if (state.status === "FINISHED" || state.selectedOptionId !== null || state.currentCorrectId === null) return;

    const match = checkTypingMatch(typedText, correctName);
    const isSuccess = match.isExact || match.isPartial;
    const timeTaken = Date.now() - (state.currentStartTime || Date.now());

    try {
      useLearningStore.getState().recordAnswer(state.currentCorrectId, isSuccess, timeTaken);
    } catch (error) {
      console.error("Erro silencioso LearningStore:", error);
    }

    const currentRemaining = Array.isArray(state.remainingIds) ? state.remainingIds : [];
    const newRemaining = [...currentRemaining];

    if (!isSuccess && state.gameMode === 'ADVANCED') {
      const insertIndex = Math.min(3, newRemaining.length);
      newRemaining.splice(insertIndex, 0, state.currentCorrectId);
    } else if (isSuccess && state.gameMode === 'ADVANCED' && timeTaken > 6000) {
      const insertIndex = Math.min(8, newRemaining.length);
      newRemaining.splice(insertIndex, 0, state.currentCorrectId);
    }

    set({
      selectedOptionId: isSuccess ? state.currentCorrectId : -1,
      isPartialMatch: match.isPartial,
      score: isSuccess ? (state.score || 0) + 1 : (state.score || 0),
      totalAnswered: (state.totalAnswered || 0) + 1,
      streak: isSuccess ? (state.streak || 0) + 1 : 0,
      remainingIds: newRemaining,
    });
  },

  nextQuestion: () => {
    const state = get();
    const currentRemaining = Array.isArray(state.remainingIds) ? state.remainingIds : [];

    if (currentRemaining.length === 0) {
      set({ 
        status: "FINISHED",
        sessionEndTime: Date.now() 
      });
      return;
    }

    // Buscamos a piscina correta para gerar as alternativas falsas da próxima rodada
    let allPossible = Array.from({ length: 1025 }, (_, i) => i + 1);
    if (state.lastGameConfig && state.lastGameConfig.customIds && state.lastGameConfig.customIds.length >= 4) {
      allPossible = state.lastGameConfig.customIds;
    } else if (state.region !== "ALL") {
      const [min, max] = REGION_RANGES[state.region];
      if (max - min + 1 >= 4) {
        allPossible = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      }
    }

    const nextCorrectId = currentRemaining[0];
    const newRemaining = currentRemaining.slice(1);
    const options = generateOptions(nextCorrectId, allPossible);

    set({
      currentCorrectId: nextCorrectId,
      currentOptionIds: options,
      selectedOptionId: null,
      isPartialMatch: false,
      remainingIds: newRemaining,
      currentStartTime: Date.now(),
    });
  },

  toggleSilhouetteMode: () => set((state) => ({ isSilhouetteMode: !state.isSilhouetteMode })),
  
  restartCurrentGame: () => {
    const config = get().lastGameConfig;
    if (!config) return;
    get().startGame(config.region, config.order, config.isSilhouetteMode, config.mode, config.answerMode, config.customIds);
  },

  resetGame: () => set({ status: "IDLE", currentCorrectId: null, currentOptionIds: [], selectedOptionId: null, isPartialMatch: false }),
}));