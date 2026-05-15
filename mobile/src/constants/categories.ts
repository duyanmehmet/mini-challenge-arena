export type CategoryId =
  | 'history' | 'geography' | 'science' | 'general' | 'art' | 'cinema' | 'sports'
  | 'turkey'
  | 'kids' | 'license' | 'medical' | 'economy'
  | 'arabic' | 'french' | 'german' | 'spanish';

export type GroupId = 'culture' | 'special' | 'language';

export interface CategoryConfig {
  id: CategoryId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  group: GroupId;
  description: string;
  questionCount: number;
}

export interface CategoryGroup {
  id: GroupId;
  label: string;
  icon: string;
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { id: 'culture',  label: 'Kültür & Bilim', icon: '🏛️' },
  { id: 'special',  label: 'Özel Kategoriler', icon: '⭐' },
  { id: 'language', label: 'Dil Öğren',        icon: '🌐' },
];

export const CATEGORIES: CategoryConfig[] = [
  // Kültür & Bilim
  { id: 'history',   name: 'Tarih',          shortName: 'Tarih',    icon: '🏺', color: '#c0392b', group: 'culture',  description: 'Osmanlı\'dan Cumhuriyet\'e, dünya tarihinden önemli olaylar.',        questionCount: 97  },
  { id: 'geography', name: 'Coğrafya',        shortName: 'Coğrafya', icon: '🌍', color: '#27ae60', group: 'culture',  description: 'Ülkeler, başkentler, dağlar, nehirler ve daha fazlası.',              questionCount: 119 },
  { id: 'science',   name: 'Bilim',           shortName: 'Bilim',    icon: '🔬', color: '#2980b9', group: 'culture',  description: 'Fizik, kimya, biyoloji ve evren hakkında sorular.',                  questionCount: 118 },
  { id: 'general',   name: 'Genel Kültür',    shortName: 'Genel',    icon: '💡', color: '#8e44ad', group: 'culture',  description: 'Her konudan karışık sorular — klasik bilgi yarışması tarzı!',       questionCount: 100 },
  { id: 'art',       name: 'Sanat',           shortName: 'Sanat',    icon: '🎨', color: '#e67e22', group: 'culture',  description: 'Resim, müzik, edebiyat ve mimariden sorular.',                       questionCount: 94  },
  { id: 'cinema',    name: 'Sinema & TV',     shortName: 'Sinema',   icon: '🎬', color: '#e91e8c', group: 'culture',  description: 'Türk dizileri, dünya filmleri, Oscar ödülleri ve aktörler.',         questionCount: 121 },
  { id: 'sports',    name: 'Spor',            shortName: 'Spor',     icon: '⚽', color: '#16a085', group: 'culture',  description: 'Futbol, olimpiyatlar, Türk sporcular ve dünya rekorları.',           questionCount: 119 },
  { id: 'turkey',    name: 'Türkiye',         shortName: 'Türkiye',  icon: '🇹🇷', color: '#e74c3c', group: 'culture',  description: 'Şehirler, kültür, mutfak, tarih ve Türkiye\'ye özgü bilgiler!',    questionCount: 94  },

  // Özel Kategoriler
  { id: 'kids',      name: 'Çocuklar İçin',  shortName: 'Çocuk',   icon: '🧒', color: '#ff6b9d', group: 'special',  description: 'Eğlenceli ve kolay sorular — 8-14 yaş için!',                        questionCount: 121 },
  { id: 'license',   name: 'Ehliyet Sınavı', shortName: 'Ehliyet', icon: '🚗', color: '#555555', group: 'special',  description: 'Trafik kuralları ve ehliyet sınav soruları.',                         questionCount: 82  },
  { id: 'medical',   name: 'Tıbbi Terimler', shortName: 'Tıp',     icon: '🩺', color: '#e74c3c', group: 'special',  description: 'Hastalık adları, organ isimleri ve tıp terimleri.',                   questionCount: 93  },
  { id: 'economy',   name: 'Ekonomi',        shortName: 'Ekonomi', icon: '📈', color: '#2ecc71', group: 'special',  description: 'Finans, borsa, ekonomi kavramları ve Türkiye ekonomisi.',             questionCount: 92  },

  // Dil Öğren
  { id: 'arabic',    name: 'Arapça',         shortName: 'Arapça',  icon: '🇸🇦', color: '#1a5276', group: 'language', description: 'Temel Arapça kelimeler, sayılar ve günlük kullanım.',                 questionCount: 50  },
  { id: 'french',    name: 'Fransızca',      shortName: 'Fransız', icon: '🇫🇷', color: '#1a5276', group: 'language', description: 'Temel Fransızca kelimeler ve günlük ifadeler.',                       questionCount: 50  },
  { id: 'german',    name: 'Almanca',        shortName: 'Almanca', icon: '🇩🇪', color: '#1a5276', group: 'language', description: 'Temel Almanca kelimeler ve yaygın kullanım.',                        questionCount: 50  },
  { id: 'spanish',   name: 'İspanyolca',     shortName: 'İspanyol',icon: '🇪🇸', color: '#1a5276', group: 'language', description: 'Temel İspanyolca kelimeler ve günlük ifadeler.',                     questionCount: 50  },
];

export function getCategoriesByGroup(group: GroupId): CategoryConfig[] {
  return CATEGORIES.filter((c) => c.group === group);
}
