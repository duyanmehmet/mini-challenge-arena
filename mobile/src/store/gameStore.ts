import { create } from 'zustand';
import type { GameModeId } from '../constants/gameModes';
import { useUserStore } from './userStore';

interface GameState {
  currentMode: GameModeId | null;
  score: number;
  combo: number;
  maxCombo: number;
  lives: number;
  isPlaying: boolean;
  isPaused: boolean;
  startTime: number | null;
  startGame: (mode: GameModeId) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => { score: number; maxCombo: number; durationSeconds: number };
  addScore: (points: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  loseLife: () => boolean;
  buyLife: (cost: number) => boolean;
  resetGame: () => void;
}


const COMBO_MULTIPLIERS = [1, 1, 2, 2, 3, 3, 4, 5, 6, 8];

function getComboMultiplier(combo: number): number {
  const idx = Math.min(combo, COMBO_MULTIPLIERS.length - 1);
  return COMBO_MULTIPLIERS[idx];
}

export const useGameStore = create<GameState>((set, get) => ({
  currentMode: null,
  score: 0,
  combo: 0,
  maxCombo: 0,
  lives: 3,
  isPlaying: false,
  isPaused: false,
  startTime: null,

  startGame: (mode) => set({
    currentMode: mode,
    score: 0,
    combo: 0,
    maxCombo: 0,
    lives: 3,
    isPlaying: true,
    isPaused: false,
    startTime: Date.now(),
  }),

  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),

  endGame: () => {
    const { score, maxCombo, startTime } = get();
    const durationSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    set({ isPlaying: false, isPaused: false });
    return { score, maxCombo, durationSeconds };
  },

  addScore: (basePoints) => {
    const { combo } = get();
    const multiplier = getComboMultiplier(combo);
    set((s) => ({ score: s.score + basePoints * multiplier }));
  },

  incrementCombo: () => {
    set((s) => {
      const next = s.combo + 1;
      return { combo: next, maxCombo: Math.max(s.maxCombo, next) };
    });
  },

  resetCombo: () => set({ combo: 0 }),

  loseLife: () => {
    const lives = get().lives - 1;
    set({ lives, combo: 0 });
    return lives <= 0;
  },

  buyLife: (cost) => {
    const { user, addCoins } = useUserStore.getState();
    if (!user || user.coins < cost) return false;
    addCoins(-cost);
    set((s) => ({ lives: s.lives + 1 }));
    return true;
  },

  resetGame: () => set({

    currentMode: null,
    score: 0,
    combo: 0,
    maxCombo: 0,
    lives: 3,
    isPlaying: false,
    isPaused: false,
    startTime: null,
  }),
}));

export { getComboMultiplier };
