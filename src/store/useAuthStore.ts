// src/store/useAuthStore.ts
import { create } from "zustand";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLearningStore } from "./useLearningStore";

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
    onAuthStateChanged(auth, async (currentUser) => {
      set({ user: currentUser, isLoading: false });
      
      if (currentUser) {
        // Se logou, baixa as estrelas do banco de dados
        await useLearningStore.getState().syncFromFirebase(currentUser.uid);
      } else {
        // Se saiu, limpa a memória
        useLearningStore.getState().clearLearningData();
      }
    });
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },
}));