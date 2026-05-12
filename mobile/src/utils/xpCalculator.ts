export const XP_PER_LEVEL = 1000;

export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
};

export const getProgressToNextLevel = (xp: number): number => {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
};

export const getRemainingXP = (xp: number): number => {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL);
};

export const getLeagueForLevel = (level: number): string => {
  if (level >= 50) return 'Legend';
  if (level >= 40) return 'Diamond';
  if (level >= 30) return 'Gold';
  if (level >= 15) return 'Silver';
  return 'Bronze';
};
