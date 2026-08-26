import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface GoFestState {
  captured: Record<string, boolean>;
  toggleCaptured: (key: string) => void;
}

export const useGoFestStore = create<GoFestState>()(
  persist(
    (set) => ({
      captured: {},
      toggleCaptured: (key) => set((state) => ({ captured: { ...state.captured, [key]: !state.captured[key] } })),
    }),
    { name: "pokepedro-gofest-2026", storage: createJSONStorage(() => localStorage) },
  ),
);
