export type GameModeId = 'reflex' | 'memory' | 'football' | 'word' | 'escape' | 'math' | 'english';

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
    description: 'Verilen harflerden Türkçe kelimeler türet, anlamlarını öğren!',
    icon: '📝',
    duration: 30,
    color: '#f0c040',
    tag: 'Türkçe & Dil',
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
