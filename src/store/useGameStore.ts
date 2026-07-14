import { create } from "zustand";
import { Region, OrderType, GameStatus, REGION_RANGES } from "@/types/pokemon";

interface GameState {
  // Configurações e Estado da Rodada
  status: GameStatus;
  region: Region;
  order: OrderType;
  isSilhouetteMode: boolean; // 👈 NOVO: Controle do Modo Silhueta
  
  // Controle do Pool
  remainingIds: number[];
  totalInRegion: number;
  
  // Rodada Atual
  currentCorrectId: number | null;
  currentOptionIds: number[];
  selectedOptionId: number | null;
  
  // Estatísticas da Sessão
  score: number;
  totalAnswered: number;
  streak: number;
  bestStreak: number;

  // Ações do Jogo
  startGame: (region: Region, order: OrderType, silhouetteMode?: boolean) => void;
  toggleSilhouetteMode: () => void; // 👈 NOVO: Liga/Desliga o Modo Difícil
  nextQuestion: () => void;
  answerQuestion: (selectedId: number) => void;
  resetGame: () => void;
}

const getRandomInt = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useGameStore = create<GameState>((set, get) => ({
  status: "IDLE",
  region: "ALL",
  order: "RANDOM",
  isSilhouetteMode: false, // 👈 Padrão: FALSE (Mostra a foto normal para aprender!)
  
  remainingIds: [],
  totalInRegion: 0,
  
  currentCorrectId: null,
  currentOptionIds: [],
  selectedOptionId: null,
  
  score: 0,
  totalAnswered: 0,
  streak: 0,
  bestStreak: 0,

  startGame: (region, order, silhouetteMode = false) => {
    const [min, max] = REGION_RANGES[region];
    const total = max - min + 1;
    let ids = Array.from({ length: total }, (_, i) => min + i);
    
    if (order === "RANDOM") {
      ids = shuffleArray(ids);
    }

    set({
      status: "PLAYING",
      region,
      order,
      isSilhouetteMode: silhouetteMode,
      remainingIds: ids,
      totalInRegion: total,
      score: 0,
      totalAnswered: 0,
      streak: 0,
      bestStreak: 0,
    });

    get().nextQuestion();
  },

  // Alterna entre Modo Normal (Foto) e Modo Difícil (Silhueta) em tempo real!
  toggleSilhouetteMode: () => {
    set((state) => ({ isSilhouetteMode: !state.isSilhouetteMode }));
  },

  nextQuestion: () => {
    const { remainingIds, region } = get();

    if (remainingIds.length === 0) {
      set({ status: "FINISHED", currentCorrectId: null, currentOptionIds: [] });
      return;
    }

    const nextIds = [...remainingIds];
    const correctId = nextIds.shift()!;

    const [min, max] = REGION_RANGES[region];
    const wrongIds = new Set<number>();
    
    while (wrongIds.size < 3) {
      const randomId = getRandomInt(min, max);
      if (randomId !== correctId && !wrongIds.has(randomId)) {
        wrongIds.add(randomId);
      }
    }

    const options = shuffleArray([correctId, ...Array.from(wrongIds)]);

    set({
      status: "PLAYING",
      remainingIds: nextIds,
      currentCorrectId: correctId,
      currentOptionIds: options,
      selectedOptionId: null,
    });
  },

  answerQuestion: (selectedId) => {
    const { currentCorrectId, score, totalAnswered, streak, bestStreak, status } = get();
    
    if (status !== "PLAYING" || currentCorrectId === null) return;

    const isCorrect = selectedId === currentCorrectId;
    const newStreak = isCorrect ? streak + 1 : 0;
    const newBestStreak = Math.max(bestStreak, newStreak);

    set({
      status: "ANSWERED",
      selectedOptionId: selectedId,
      score: isCorrect ? score + 1 : score,
      totalAnswered: totalAnswered + 1,
      streak: newStreak,
      bestStreak: newBestStreak,
    });
  },

  resetGame: () => {
    set({
      status: "IDLE",
      remainingIds: [],
      currentCorrectId: null,
      currentOptionIds: [],
      selectedOptionId: null,
    });
  },
}));