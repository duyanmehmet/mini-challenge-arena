export type GameModeId = 'reflex' | 'memory' | 'football' | 'word' | 'attention' | 'escape';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  description: string;
  icon: string;
  duration: number;
  color: string;
}

export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'reflex',
    name: 'Refleks Modu',
    description: 'Hedeflere olabildiğince hızlı dokun!',
    icon: '⚡',
    duration: 30,
    color: '#e94560',
  },
  {
    id: 'memory',
    name: 'Hafıza Modu',
    description: 'Diziyi ezberle ve tekrarla!',
    icon: '🧠',
    duration: 25,
    color: '#9b59b6',
  },
  {
    id: 'football',
    name: 'Mini Futbol',
    description: '10 atışta en yüksek skoru yap!',
    icon: '⚽',
    duration: 0,
    color: '#2ecc71',
  },
  {
    id: 'word',
    name: 'Kelime Yarışı',
    description: 'Harflerden Türkçe kelimeler bul!',
    icon: '📝',
    duration: 30,
    color: '#f0c040',
  },
  {
    id: 'attention',
    name: 'Dikkat Oyunu',
    description: 'Farklı olanı bul!',
    icon: '🎯',
    duration: 20,
    color: '#4ecdc4',
  },
  {
    id: 'escape',
    name: 'Kaçış Modu',
    description: 'Ne kadar hayatta kalabilirsin?',
    icon: '🏃',
    duration: 0,
    color: '#e67e22',
  },
];
