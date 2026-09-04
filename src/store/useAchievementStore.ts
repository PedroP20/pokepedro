import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ACHIEVEMENTS, AchievementDefinition, regionForPokemon } from "@/lib/achievements";
import { db } from "@/lib/firebase";

export interface AchievementProgress {
  startedAt: number;
  correct: number;
  currentStreak: number;
  maxStreak: number;
  uniquePokemonIds: number[];
  kantoIds: number[];
  johtoIds: number[];
  hoennIds: number[];
  typeCorrect: number;
  unlocked: Record<string, number>;
}

const freshProgress = (): AchievementProgress => ({ startedAt: Date.now(), correct: 0, currentStreak: 0, maxStreak: 0, uniquePokemonIds: [], kantoIds: [], johtoIds: [], hoennIds: [], typeCorrect: 0, unlocked: {} });
const addUnique = (values: number[], value: number) => values.includes(value) ? values : [...values, value];

const metricValue = (progress: AchievementProgress, definition: AchievementDefinition) => {
  if (definition.metric === "correct") return progress.correct;
  if (definition.metric === "streak") return progress.maxStreak;
  if (definition.metric === "unique") return progress.uniquePokemonIds.length;
  if (definition.metric === "region-kanto") return progress.kantoIds.length;
  if (definition.metric === "region-johto") return progress.johtoIds.length;
  if (definition.metric === "region-hoenn") return progress.hoennIds.length;
  return progress.typeCorrect;
};

interface AchievementState {
  progress: AchievementProgress;
  notificationQueue: string[];
  isSynced: boolean;
  recordPokemonAnswer: (pokemonId: number, isCorrect: boolean) => void;
  recordTypeAnswer: (isCorrect: boolean) => void;
  dismissNotification: () => void;
  syncFromFirebase: (uid: string) => Promise<void>;
  clearLocalProgress: () => void;
}

export const useAchievementStore = create<AchievementState>()(persist((set, get) => {
  const update = (next: AchievementProgress) => {
    const newlyUnlocked = ACHIEVEMENTS.filter((achievement) => !next.unlocked[achievement.id] && metricValue(next, achievement) >= achievement.target);
    if (newlyUnlocked.length) {
      const timestamp = Date.now();
      newlyUnlocked.forEach((achievement) => { next.unlocked[achievement.id] = timestamp; });
    }
    set((state) => ({ progress: next, notificationQueue: [...state.notificationQueue, ...newlyUnlocked.map((achievement) => achievement.id)] }));
  };
  return {
    progress: freshProgress(), notificationQueue: [], isSynced: false,
    recordPokemonAnswer: (pokemonId, isCorrect) => {
      const current = get().progress;
      const region = regionForPokemon(pokemonId);
      const next: AchievementProgress = { ...current, currentStreak: isCorrect ? current.currentStreak + 1 : 0 };
      if (isCorrect) {
        next.correct = current.correct + 1;
        next.maxStreak = Math.max(current.maxStreak, next.currentStreak);
        next.uniquePokemonIds = addUnique(current.uniquePokemonIds, pokemonId);
        if (region === "KANTO") next.kantoIds = addUnique(current.kantoIds, pokemonId);
        if (region === "JOHTO") next.johtoIds = addUnique(current.johtoIds, pokemonId);
        if (region === "HOENN") next.hoennIds = addUnique(current.hoennIds, pokemonId);
      }
      update(next);
    },
    recordTypeAnswer: (isCorrect) => {
      const current = get().progress;
      const next = { ...current, typeCorrect: current.typeCorrect + (isCorrect ? 1 : 0) };
      update(next);
    },
    dismissNotification: () => set((state) => ({ notificationQueue: state.notificationQueue.slice(1) })),
    syncFromFirebase: async (uid) => {
      if (!db) return;
      const ref = doc(db, "users", uid, "achievements", "progress");
      try {
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) set({ progress: snapshot.data() as AchievementProgress, notificationQueue: [], isSynced: true });
        else {
          await setDoc(ref, get().progress);
          set({ isSynced: true });
        }
      } catch (error) { console.error("Erro ao sincronizar conquistas:", error); }
    },
    clearLocalProgress: () => set({ progress: freshProgress(), notificationQueue: [], isSynced: false }),
  };
}, { name: "pokepedro-achievements-v1", storage: createJSONStorage(() => localStorage), partialize: (state) => ({ progress: state.progress }) }));

export const getAchievementValue = (progress: AchievementProgress, definition: AchievementDefinition) => metricValue(progress, definition);
