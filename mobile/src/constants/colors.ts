const dark = {
  bgPrimary: '#1a1a2e',
  bgSecondary: '#16213e',
  bgTertiary: '#0f3460',
  accentRed: '#e94560',
  accentYellow: '#f0c040',
  accentTeal: '#4ecdc4',
  accentGreen: '#2ecc71',
  accentPurple: '#9b59b6',
  textPrimary: '#ffffff',
  textSecondary: '#8888aa',
  border: '#ffffff18',
  cardBg: '#16213e',
  success: '#2ecc71',
  danger: '#e94560',
  warning: '#f0c040',
};

const light = {
  bgPrimary: '#f5f5f5',
  bgSecondary: '#ffffff',
  bgTertiary: '#e8e8f0',
  accentRed: '#d63851',
  accentYellow: '#d4a017',
  accentTeal: '#2ba8a1',
  accentGreen: '#27ae60',
  accentPurple: '#8e44ad',
  textPrimary: '#1a1a2e',
  textSecondary: '#666680',
  border: '#00000018',
  cardBg: '#ffffff',
  success: '#27ae60',
  danger: '#d63851',
  warning: '#d4a017',
};

export const Colors = { dark, light };
export type ColorScheme = typeof dark;
