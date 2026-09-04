// src/store/useAuthStore.ts
import { create } from "zustand";
import { User, onAuthStateChanged, signOut, Unsubscribe } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLearningStore } from "./useLearningStore";
import { useAchievementStore } from "./useAchievementStore";

let authUnsubscribe: Unsubscribe | null = null;

interface AuthState {
  user: User | null;
  isLoading: boolean;
  initAuthListener: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // O app começa "carregando" para não piscar a tela errada

  initAuthListener: () => {
    if (authUnsubscribe) return;
    if (!auth) {
      console.error("Firebase não foi inicializada. Confira as variáveis de ambiente.");
      set({ user: null, isLoading: false });
      return;
    }

    authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      set({ user: currentUser, isLoading: false });
      
      if (currentUser) {
        // Se logou, baixa as estrelas do banco de dados
        await useLearningStore.getState().syncFromFirebase(currentUser.uid);
        await useAchievementStore.getState().syncFromFirebase(currentUser.uid);
      } else {
        // Se saiu, limpa a memória
        useLearningStore.getState().clearLearningData();
        useAchievementStore.getState().clearLocalProgress();
      }
    });
  },

  logout: async () => {
    if (!auth) {
      set({ user: null, isLoading: false });
      return;
    }
    await signOut(auth);
    useLearningStore.getState().clearLearningData();
    useAchievementStore.getState().clearLocalProgress();
    set({ user: null });
  },
}));
