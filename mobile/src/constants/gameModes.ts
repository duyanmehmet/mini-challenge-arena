export type GameModeId = 'reflex' | 'memory' | 'football' | 'word' | 'attention' | 'escape';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  duration: number;
  color: string;
  tag: string;        // eğitici etiket
}

export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'reflex',
    name: 'Refleks Modu',
    shortName: 'Refleks',
    description: 'Hedeflere olabildiğince hızlı dokun! Combo yap, bonus kazan.',
    icon: '⚡',
    duration: 30,
    color: '#e94560',
    tag: 'Hız & Koordinasyon',
  },
  {
    id: 'memory',
    name: 'Hafıza Modu',
    shortName: 'Hafıza',
    description: 'Gösterilen diziyi ezberle ve aynı sırayla tekrarla!',
    icon: '🧠',
    duration: 25,
    color: '#9b59b6',
    tag: 'Bellek Güçlendirme',
  },
  {
    id: 'football',
    name: 'Mini Futbol',
    shortName: 'Futbol',
    description: '10 atışta mümkün olan en yüksek skoru yap!',
    icon: '⚽',
    duration: 0,
    color: '#2ecc71',
    tag: 'Strateji & Hassasiyet',
  },
  {
    id: 'word',
    name: 'Kelime Yarışı',
    shortName: 'Kelime',
    description: 'Verilen harflerden Türkçe kelimeler türet!',
    icon: '📝',
    duration: 30,
    color: '#f0c040',
    tag: 'Türkçe & Dil',
  },
  {
    id: 'attention',
    name: 'Dikkat Oyunu',
    shortName: 'Dikkat',
    description: 'Nesneler arasındaki farklı olanı bul ve dokun!',
    icon: '🔍',
    duration: 20,
    color: '#4ecdc4',
    tag: 'Odak & Algı',
  },
  {
    id: 'escape',
    name: 'Kaçış Modu',
    shortName: 'Kaçış',
    description: 'Engelleri aş, ne kadar hayatta kalabilirsin?',
    icon: '🏃',
    duration: 0,
    color: '#e67e22',
    tag: 'Refleks & Strateji',
  },
];
