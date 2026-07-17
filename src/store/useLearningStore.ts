// src/store/useLearningStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PokemonStats {
  id: number;
  timesEncountered: number;
  timesCorrect: number;
  timesWrong: number;
  avgTimeMs: number;
  lastEncounter: number;
}

interface LearningState {
  stats: Record<number, PokemonStats>;
  recordAnswer: (id: number, isCorrect: boolean, timeMs: number) => void;
  getMissedPokemon: () => PokemonStats[];
  getStruggledPokemon: (thresholdMs?: number) => PokemonStats[];
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      stats: {},
      recordAnswer: (id, isCorrect, timeMs) => set((state) => {
        // 🛡️ BLINDAGEM: Garante que stats nunca seja undefined (auto-cura de cache)
        const currentStats = state.stats || {};
        const current = currentStats[id] || {
          id, timesEncountered: 0, timesCorrect: 0, timesWrong: 0, avgTimeMs: 0, lastEncounter: 0
        };
        
        const newAvg = current.timesEncountered === 0 
            ? timeMs 
            : Math.round(((current.avgTimeMs * current.timesEncountered) + timeMs) / (current.timesEncountered + 1));

        return {
          stats: {
            ...currentStats,
            [id]: {
              ...current,
              timesEncountered: current.timesEncountered + 1,
              timesCorrect: current.timesCorrect + (isCorrect ? 1 : 0),
              timesWrong: current.timesWrong + (isCorrect ? 0 : 1),
              avgTimeMs: newAvg,
              lastEncounter: Date.now(),
            }
          }
        };
      }),
      getMissedPokemon: () => {
         const currentStats = get().stats || {};
         return Object.values(currentStats)
           .filter(p => p && p.timesWrong > 0)
           .sort((a, b) => b.timesWrong - a.timesWrong);
      },
      getStruggledPokemon: (thresholdMs = 5000) => {
         const currentStats = get().stats || {};
         return Object.values(currentStats)
           .filter(p => p && p.avgTimeMs > thresholdMs && p.timesWrong === 0)
           .sort((a, b) => b.avgTimeMs - a.avgTimeMs);
      }
    }),
    { name: 'pokepedro-learning-storage' }
  )
);