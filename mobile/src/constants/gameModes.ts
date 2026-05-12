export type GameModeId = 'reflex' | 'word' | 'math' | 'english';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  duration: number;
  color: string;
  tag: string;
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
    id: 'word',
    name: 'Kelime Quizi',
    shortName: 'Kelime',
    description: 'Verilen Türkçe tanıma göre doğru kelimeyi bul!',
    icon: '📖',
    duration: 60,
    color: '#f0c040',
    tag: 'Türkçe & Sözlük',
  },
  {
    id: 'math',
    name: 'Matematik Hızı',
    shortName: 'Matematik',
    description: '30 saniyede mümkün olduğunca çok işlem çöz!',
    icon: '🔢',
    duration: 30,
    color: '#3498db',
    tag: 'Sayısal Düşünme',
  },
  {
    id: 'english',
    name: 'İngilizce Öğren',
    shortName: 'İngilizce',
    description: '5000+ İngilizce kelimeyi Türkçe karşılıklarıyla öğren!',
    icon: '🇬🇧',
    duration: 60,
    color: '#1abc9c',
    tag: 'İngilizce & Dil',
  },
];
