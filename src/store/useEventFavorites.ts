'use client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useEventFavorites = create<{ ids: string[]; toggle: (id: string) => void }>()(persist(
  set => ({ ids: [], toggle: id => set(state => ({ ids: state.ids.includes(id) ? state.ids.filter(item => item !== id) : [...state.ids, id] })) }),
  {
    name: 'pokepedro-event-favorites', storage: createJSONStorage(() => localStorage), version: 1,
    migrate: persisted => {
      const ids = (persisted as { ids?: string[] })?.ids ?? [];
      return { ids: [...new Set(ids.flatMap(id => id === 'gofest' ? ['mega-ascensao', 'megafinal-2026'] : [id]))] };
    },
  },
));
