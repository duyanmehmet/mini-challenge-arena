export const calculateScore = (
  baseScore: number,
  combo: number,
  timeRemaining: number,
  difficultyMultiplier: number = 1
): number => {
  const comboBonus = Math.floor(baseScore * (combo * 0.1));
  const timeBonus = Math.floor(timeRemaining * 10);
  return Math.floor((baseScore + comboBonus + timeBonus) * difficultyMultiplier);
};

export const calculateXP = (score: number): number => {
  return Math.floor(score / 10);
};

export const calculateCoins = (score: number): number => {
  return Math.floor(score / 100);
};
