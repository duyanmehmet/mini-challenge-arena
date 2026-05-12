import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import type { CategoryId as GameModeId } from '../constants/categories';

export function useGame() {
  const store = useGameStore();

  const start = useCallback((mode: GameModeId) => {
    store.startGame(mode);
  }, []);

  const finish = useCallback(() => store.endGame(), []);
  const pause  = useCallback(() => store.pauseGame(), []);
  const resume = useCallback(() => store.resumeGame(), []);

  return {
    score:      store.score,
    combo:      store.combo,
    maxCombo:   store.maxCombo,
    lives:      store.lives,
    isPlaying:  store.isPlaying,
    isPaused:   store.isPaused,
    start,
    finish,
    pause,
    resume,
    addScore:       store.addScore,
    incrementCombo: store.incrementCombo,
    resetCombo:     store.resetCombo,
    loseLife:       store.loseLife,
  };
}
