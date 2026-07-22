// src/store/useGameStore.ts
import { create } from "zustand";
import { Region, OrderType, GameStatus, REGION_RANGES } from "@/types/pokemon";
import { useLearningStore } from "./useLearningStore";
import { useSavedGameStore } from "./useSavedGameStore";
import { checkTypingMatch } from "@/lib/stringUtils";

export type GameMode = 'NORMAL' | 'ADVANCED';
export type AnswerMode = 'OPTIONS' | 'TYPING';
export type MediaStyle = 'IMAGE' | 'SILHOUETTE' | 'AUDIO';
export type MultiplayerType = 'FFA' | 'TEAMS';

export interface Player {
  id: number;
  name: string;
  score: number;
}

export interface GameConfig {
  region: Region;
  order: OrderType;
  mediaStyle: MediaStyle;
  mode: GameMode;
  answerMode: AnswerMode;
  isPersistent: boolean;
  isMultiplayer: boolean;
  multiplayerType: MultiplayerType;
  playerCount: number;
  customIds?: number[];
}

export interface GameState {
  status: GameStatus;
  gameMode: GameMode;
  answerMode: AnswerMode;
  mediaStyle: MediaStyle;
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
  isPersistent: boolean;

  isMultiplayer: boolean;
  multiplayerType: MultiplayerType;
  players: Player[];
  currentPlayerIndex: number;

  learningPhase: number; // ⭐ Controle das 3 Etapas do Aprender
  lastGameConfig: GameConfig | null;

  startGame: (region: Region, order: OrderType, mediaStyle: MediaStyle, mode?: GameMode, answerMode?: AnswerMode, isPersistent?: boolean, isMultiplayer?: boolean, multiplayerType?: MultiplayerType, playerCount?: number, customIds?: number[]) => void;
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

function generateOptions(correctId: number, allPossibleIds: number[]): number[] {
  const options = [correctId];
  let poolToPickFrom = allPossibleIds;
  if (new Set(allPossibleIds).size < 4) {
    poolToPickFrom = Array.from({ length: 1025 }, (_, i) => i + 1);
  }
  let safetyCounter = 0;
  while (options.length < 4 && safetyCounter < 1000) {
    safetyCounter++;
    const randomId = poolToPickFrom[Math.floor(Math.random() * poolToPickFrom.length)];
    if (!options.includes(randomId)) options.push(randomId);
  }
  return shuffleArray(options);
}

const triggerSavedGameUpdate = (state: GameState) => {
  if (state.isPersistent && state.status === "PLAYING" && state.currentCorrectId !== null) {
    useSavedGameStore.getState().saveGame({
      mode: state.gameMode, answerMode: state.answerMode, mediaStyle: state.mediaStyle,
      region: state.region, order: state.order, remainingIds: state.remainingIds,
      score: state.score, totalAnswered: state.totalAnswered, streak: state.streak,
      totalInRegion: state.totalInRegion, currentCorrectId: state.currentCorrectId,
      sessionStartTime: state.sessionStartTime, isMultiplayer: state.isMultiplayer,
      multiplayerType: state.multiplayerType, players: state.players,
      currentPlayerIndex: state.currentPlayerIndex, learningPhase: state.learningPhase,
    });
  }
};

export const useGameStore = create<GameState>((set, get) => ({
  status: "IDLE", gameMode: 'NORMAL', answerMode: 'OPTIONS', mediaStyle: 'IMAGE',
  region: "ALL", order: "RANDOM", isSilhouetteMode: false, currentCorrectId: null,
  currentOptionIds: [], selectedOptionId: null, isPartialMatch: false, score: 0,
  totalAnswered: 0, streak: 0, totalInRegion: 0, remainingIds: [], currentStartTime: 0,
  sessionStartTime: 0, sessionEndTime: 0, isPersistent: false, isMultiplayer: false,
  multiplayerType: 'FFA', players: [], currentPlayerIndex: 0, learningPhase: 1, lastGameConfig: null,

  startGame: (region, order, mediaStyle, mode = 'NORMAL', answerMode = 'OPTIONS', isPersistent = false, isMultiplayer = false, multiplayerType = 'FFA', playerCount = 2, customIds) => {
    let idsToPlay: number[] = [];
    if (customIds && customIds.length > 0) idsToPlay = [...customIds];
    else {
      const [min, max] = REGION_RANGES[region] || [1, 1025];
      idsToPlay = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }
    const totalInRegion = idsToPlay.length;
    if (order === "RANDOM") idsToPlay = shuffleArray(idsToPlay);
    else idsToPlay.sort((a, b) => a - b);

    const firstCorrectId = idsToPlay[0];
    const remaining = idsToPlay.slice(1);
    const options = generateOptions(firstCorrectId, idsToPlay);
    const now = Date.now();

    const players: Player[] = [];
    if (isMultiplayer) {
      const count = Math.min(multiplayerType === 'FFA' ? 10 : 5, Math.max(2, playerCount));
      for (let i = 1; i <= count; i++) players.push({ id: i, name: multiplayerType === 'FFA' ? `Treinador ${i}` : `Dupla ${i}`, score: 0 });
    }

    // ⭐ MODO APRENDER FORÇA FASE 1, OPÇÕES E IMAGEM
    let effectiveAnswerMode = answerMode;
    let effectiveMediaStyle = mediaStyle;
    if (mode === 'ADVANCED') {
      effectiveAnswerMode = 'OPTIONS';
      effectiveMediaStyle = 'IMAGE';
    }

    if (isPersistent) useSavedGameStore.getState().clearSavedGame();

    const newState: Partial<GameState> = {
      status: "PLAYING", gameMode: mode, answerMode: effectiveAnswerMode, mediaStyle: effectiveMediaStyle,
      region, order, isSilhouetteMode: effectiveMediaStyle === 'SILHOUETTE', currentCorrectId: firstCorrectId,
      currentOptionIds: options, selectedOptionId: null, isPartialMatch: false, score: 0, totalAnswered: 0,
      streak: 0, totalInRegion, remainingIds: remaining, currentStartTime: now, sessionStartTime: now,
      sessionEndTime: 0, isPersistent, isMultiplayer, multiplayerType, players, currentPlayerIndex: 0,
      learningPhase: 1, lastGameConfig: { region, order, mediaStyle, mode, answerMode, isPersistent, isMultiplayer, multiplayerType, playerCount, customIds },
    };

    set(newState);
    triggerSavedGameUpdate(get());
  },

  answerQuestion: (selectedId) => {
    const state = get();
    if (state.status === "FINISHED" || state.selectedOptionId !== null || state.currentCorrectId === null) return;
    const isCorrect = selectedId === state.currentCorrectId;
    const timeTaken = Date.now() - (state.currentStartTime || Date.now());

    try { useLearningStore.getState().recordAnswer(state.currentCorrectId, isCorrect, timeTaken); } 
    catch (error) { console.error(error); }

    const newRemaining = [...(Array.isArray(state.remainingIds) ? state.remainingIds : [])];
    
    // ⭐ SE ERROU NO MODO APRENDER, COLOCA ELE NO FINAL DA FILA PARA REAPARECER
    if (!isCorrect && state.gameMode === 'ADVANCED') {
      const insertIndex = Math.min(3, newRemaining.length);
      newRemaining.splice(insertIndex, 0, state.currentCorrectId);
    }

    const updatedPlayers = [...state.players];
    if (state.isMultiplayer && isCorrect && updatedPlayers[state.currentPlayerIndex]) updatedPlayers[state.currentPlayerIndex].score += 1;

    set({
      selectedOptionId: selectedId, isPartialMatch: false, score: isCorrect ? (state.score || 0) + 1 : (state.score || 0),
      totalAnswered: (state.totalAnswered || 0) + 1, streak: isCorrect ? (state.streak || 0) + 1 : 0,
      remainingIds: newRemaining, players: updatedPlayers,
    });
    triggerSavedGameUpdate(get());
  },

  answerByTyping: (typedText, correctName) => {
    const state = get();
    if (state.status === "FINISHED" || state.selectedOptionId !== null || state.currentCorrectId === null) return;
    const match = checkTypingMatch(typedText, correctName);
    const isSuccess = match.isExact || match.isPartial;
    const timeTaken = Date.now() - (state.currentStartTime || Date.now());

    try { useLearningStore.getState().recordAnswer(state.currentCorrectId, isSuccess, timeTaken); } 
    catch (error) { console.error(error); }

    const newRemaining = [...(Array.isArray(state.remainingIds) ? state.remainingIds : [])];
    
    // ⭐ SE ERROU DIGITANDO, VAI PRO FIM DA FILA PARA TENTAR DE NOVO DEPOIS
    if (!isSuccess && state.gameMode === 'ADVANCED') {
      const insertIndex = Math.min(3, newRemaining.length);
      newRemaining.splice(insertIndex, 0, state.currentCorrectId);
    }

    const updatedPlayers = [...state.players];
    if (state.isMultiplayer && isSuccess && updatedPlayers[state.currentPlayerIndex]) updatedPlayers[state.currentPlayerIndex].score += 1;

    set({
      selectedOptionId: isSuccess ? state.currentCorrectId : -1, isPartialMatch: match.isPartial,
      score: isSuccess ? (state.score || 0) + 1 : (state.score || 0), totalAnswered: (state.totalAnswered || 0) + 1,
      streak: isSuccess ? (state.streak || 0) + 1 : 0, remainingIds: newRemaining, players: updatedPlayers,
    });
    triggerSavedGameUpdate(get());
  },

  nextQuestion: () => {
    const state = get();
    const currentRemaining = Array.isArray(state.remainingIds) ? state.remainingIds : [];

    // ⭐ A MÁGICA DOS 3 PASSOS (MODO APRENDER)
    if (state.gameMode === 'ADVANCED') {
      if (state.learningPhase === 1) {
        // Sai da visualização inicial e vai para as 4 Opções
        set({ learningPhase: 2, answerMode: 'OPTIONS', mediaStyle: 'IMAGE', isSilhouetteMode: false, selectedOptionId: null, isPartialMatch: false, currentStartTime: Date.now() });
        triggerSavedGameUpdate(get()); return;
      }
      if (state.learningPhase === 2 && state.selectedOptionId === state.currentCorrectId) {
        // Acertou nas opções? Vai para Digitação
        set({ learningPhase: 3, answerMode: 'TYPING', mediaStyle: 'IMAGE', isSilhouetteMode: false, selectedOptionId: null, isPartialMatch: false, currentStartTime: Date.now() });
        triggerSavedGameUpdate(get()); return;
      }
      // Se errou na fase 2 ou já terminou a fase 3, o código segue fluxo normal abaixo para ir para o próximo Pokemon (voltando pra fase 1)
    }

    if (currentRemaining.length === 0) {
      if (state.isPersistent) useSavedGameStore.getState().clearSavedGame();
      set({ status: "FINISHED", sessionEndTime: Date.now() }); return;
    }

    let allPossible = Array.from({ length: 1025 }, (_, i) => i + 1);
    if (state.lastGameConfig && state.lastGameConfig.customIds && state.lastGameConfig.customIds.length >= 4) allPossible = state.lastGameConfig.customIds;
    else if (state.region !== "ALL") {
      const [min, max] = REGION_RANGES[state.region];
      if (max - min + 1 >= 4) allPossible = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }

    const nextCorrectId = currentRemaining[0];
    const newRemaining = currentRemaining.slice(1);
    const options = generateOptions(nextCorrectId, allPossible);
    const nextPlayerIndex = state.isMultiplayer ? (state.currentPlayerIndex + 1) % state.players.length : 0;

    const baseAnswerMode = state.lastGameConfig ? state.lastGameConfig.answerMode : state.answerMode;
    const baseMediaStyle = state.lastGameConfig ? state.lastGameConfig.mediaStyle : state.mediaStyle;

    set({
      currentCorrectId: nextCorrectId, currentOptionIds: options, selectedOptionId: null, isPartialMatch: false,
      remainingIds: newRemaining, currentStartTime: Date.now(), currentPlayerIndex: nextPlayerIndex,
      answerMode: state.gameMode === 'ADVANCED' ? 'OPTIONS' : baseAnswerMode,
      mediaStyle: state.gameMode === 'ADVANCED' ? 'IMAGE' : baseMediaStyle,
      isSilhouetteMode: state.gameMode === 'ADVANCED' ? false : (baseMediaStyle === 'SILHOUETTE'),
      learningPhase: 1, // Reseta para a fase 1 no novo Pokémon!
    });
    triggerSavedGameUpdate(get());
  },

  toggleSilhouetteMode: () => {
    const state = get();
    const newStyle = state.mediaStyle === 'SILHOUETTE' ? 'IMAGE' : 'SILHOUETTE';
    set({ mediaStyle: newStyle, isSilhouetteMode: newStyle === 'SILHOUETTE' });
    triggerSavedGameUpdate(get());
  },

  restartCurrentGame: () => {
    const state = get(); const config = state.lastGameConfig; if (!config) return;
    state.startGame(config.region, config.order, config.mediaStyle, config.mode, config.answerMode, state.isPersistent, config.isMultiplayer, config.multiplayerType, config.playerCount, config.customIds);
  },

  resetGame: () => {
    const state = get(); if (state.isPersistent) useSavedGameStore.getState().clearSavedGame();
    set({ status: "IDLE", currentCorrectId: null, currentOptionIds: [], selectedOptionId: null, isPartialMatch: false, isPersistent: false });
  },
}));