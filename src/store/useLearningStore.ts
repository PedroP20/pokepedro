// src/store/useLearningStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db } from "@/lib/firebase";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { useAuthStore } from "./useAuthStore";

export interface PokemonStats {
  id: number;
  timesEncountered: number;
  timesCorrect: number;
  timesWrong: number;
  avgTimeMs: number;
  lastEncounter: number;
  comboStars: number;
  isMarkedDifficult?: boolean;
}

interface LearningState {
  stats: Record<number, PokemonStats>;
  recordAnswer: (id: number, isCorrect: boolean, timeMs: number) => void;
  getComboStars: (id: number) => number;
  
  // 🔍 FUNÇÕES LEITORAS PARA A REVISÃO
  getMissedPokemon: () => PokemonStats[];
  getStruggledPokemon: () => PokemonStats[];
  getDifficultPokemon: () => PokemonStats[]; // ⭐ NOVA FUNÇÃO AQUI!
  
  toggleDifficultyMark: (id: number) => Promise<void>;
  getMarkedDifficultPokemonIds: () => number[];

  syncFromFirebase: (uid: string) => Promise<void>;
  clearLearningData: () => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      stats: {},

      recordAnswer: async (id, isCorrect, timeMs) => {
        const currentStats = get().stats;
        const current = currentStats[id] || {
          id, timesEncountered: 0, timesCorrect: 0, timesWrong: 0, avgTimeMs: 0, lastEncounter: 0, comboStars: 0, isMarkedDifficult: false,
        };

        const newEncountered = current.timesEncountered + 1;
        const newCorrect = current.timesCorrect + (isCorrect ? 1 : 0);
        const newWrong = current.timesWrong + (isCorrect ? 0 : 1);
        const newAvgTime = current.timesEncountered === 0
          ? timeMs
          : Math.round((current.avgTimeMs * current.timesEncountered + timeMs) / newEncountered);

        const currentStars = current.comboStars || 0;
        const newComboStars = isCorrect ? Math.min(3, currentStars + 1) : 0;

        const newStatData: PokemonStats = {
          ...current,
          id,
          timesEncountered: newEncountered,
          timesCorrect: newCorrect,
          timesWrong: newWrong,
          avgTimeMs: newAvgTime,
          lastEncounter: Date.now(),
          comboStars: newComboStars,
        };

        set({ stats: { ...currentStats, [id]: newStatData } });

        const user = useAuthStore.getState().user;
        if (user) {
          try { await setDoc(doc(db, "users", user.uid, "mastery", String(id)), newStatData); } 
          catch (e) { console.error("Erro ao salvar na nuvem:", e); }
        }
      },

      toggleDifficultyMark: async (id) => {
        const currentStats = get().stats;
        const current = currentStats[id] || {
          id, timesEncountered: 0, timesCorrect: 0, timesWrong: 0, avgTimeMs: 0, lastEncounter: 0, comboStars: 0, isMarkedDifficult: false,
        };

        const newStatData: PokemonStats = {
          ...current,
          isMarkedDifficult: !current.isMarkedDifficult,
        };

        set({ stats: { ...currentStats, [id]: newStatData } });

        const user = useAuthStore.getState().user;
        if (user) {
          try { await setDoc(doc(db, "users", user.uid, "mastery", String(id)), newStatData); } 
          catch (e) { console.error("Erro ao salvar na nuvem:", e); }
        }
      },

      getMarkedDifficultPokemonIds: () => {
        return Object.values(get().stats).filter(p => p.isMarkedDifficult).map(p => p.id);
      },

      // ⭐ FUNÇÃO QUE ENTREGA A LISTA COMPLETA PARA A TELA DE REVISÃO
      getDifficultPokemon: () => {
        return Object.values(get().stats)
          .filter((stat) => stat.isMarkedDifficult)
          .sort((a, b) => a.id - b.id); // Ordena pelo número da Pokédex
      },

      getComboStars: (id) => {
        const item = get().stats[id];
        return item ? (item.comboStars || 0) : 0;
      },

      getMissedPokemon: () => {
        return Object.values(get().stats).filter((stat) => stat.timesWrong > 0).sort((a, b) => b.timesWrong - a.timesWrong);
      },

      getStruggledPokemon: () => {
        return Object.values(get().stats).filter((stat) => stat.avgTimeMs > 5000 && stat.timesCorrect > 0).sort((a, b) => b.avgTimeMs - a.avgTimeMs);
      },

      syncFromFirebase: async (uid: string) => {
        try {
          const querySnapshot = await getDocs(collection(db, "users", uid, "mastery"));
          const cloudStats: Record<number, PokemonStats> = {};
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data() as PokemonStats;
            cloudStats[data.id] = data;
          });
          set({ stats: cloudStats });
        } catch (e) {
          console.error("Erro ao sincronizar do Firebase:", e);
        }
      },

      clearLearningData: () => set({ stats: {} }),
    }),
    {
      name: 'pokepedro-learning-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
);