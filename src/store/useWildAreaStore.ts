import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface WildAreaState {
  captured: Record<string, boolean>;
  shiny: Record<string, boolean>;
  toggleCaptured: (key: string) => void;
  toggleShiny: (key: string) => void;
  reset: () => void;
}

export const useWildAreaStore = create<WildAreaState>()(
  persist(
    (set) => ({
      captured: {},
      shiny: {},
      toggleCaptured: (key) => set((state) => {
        const captured = !state.captured[key];
        // Desmarcar a captura também desmarca o brilhante.
        return { captured: { ...state.captured, [key]: captured }, shiny: captured ? state.shiny : { ...state.shiny, [key]: false } };
      }),
      // Marcar brilhante implica que o Pokémon foi capturado.
      toggleShiny: (key) => set((state) => {
        const shiny = !state.shiny[key];
        return { shiny: { ...state.shiny, [key]: shiny }, captured: shiny ? { ...state.captured, [key]: true } : state.captured };
      }),
      reset: () => set({ captured: {}, shiny: {} }),
    }),
    { name: "pokepedro-wild-area-2026", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
