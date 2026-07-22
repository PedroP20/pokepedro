// src/store/useSavedGameStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Region, OrderType } from '@/types/pokemon';
import { GameMode, AnswerMode, MediaStyle, MultiplayerType, Player } from '@/store/useGameStore';

export interface SavedGameSession {
  mode: GameMode;
  answerMode: AnswerMode;
  mediaStyle: MediaStyle;
  region: Region;
  order: OrderType;
  remainingIds: number[];
  score: number;
  totalAnswered: number;
  streak: number;
  totalInRegion: number;
  currentCorrectId: number | null;
  sessionStartTime: number;
  isMultiplayer: boolean;
  multiplayerType: MultiplayerType;
  players: Player[];
  currentPlayerIndex: number;
  learningPhase: number;
}

interface SavedGameState {
  savedSession: SavedGameSession | null;
  saveGame: (session: SavedGameSession) => void;
  clearSavedGame: () => void;
}

export const useSavedGameStore = create<SavedGameState>()(
  persist(
    (set) => ({
      savedSession: null,
      saveGame: (session) => set({ savedSession: session }),
      clearSavedGame: () => set({ savedSession: null }),
    }),
    {
      name: 'pokepedro-saved-session-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);