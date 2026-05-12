import type { CategoryId as GameModeId } from '../constants/categories';

export interface GameResult {
  mode: GameModeId;
  score: number;
  maxCombo: number;
  durationSeconds: number;
  isPersonalBest: boolean;
}

export interface Target {
  id: string;
  x: number;
  y: number;
  type: 'normal' | 'bonus' | 'trap';
}

export interface MemoryItem {
  id: string;
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'diamond';
  color: string;
}

export interface AttentionItem {
  id: string;
  shape: 'circle' | 'square' | 'triangle';
  color: string;
  size: number;
  isDifferent: boolean;
}
