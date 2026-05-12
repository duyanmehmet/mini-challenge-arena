import { useState, useCallback } from 'react';

const MULTIPLIERS = [1, 1, 2, 2, 3, 3, 4, 5, 6, 8];

export function useCombo() {
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const increment = useCallback(() => {
    setCombo((c) => {
      const next = c + 1;
      setMaxCombo((m) => Math.max(m, next));
      return next;
    });
  }, []);

  const reset = useCallback(() => setCombo(0), []);

  const multiplier = MULTIPLIERS[Math.min(combo, MULTIPLIERS.length - 1)];

  return { combo, maxCombo, multiplier, increment, reset };
}
