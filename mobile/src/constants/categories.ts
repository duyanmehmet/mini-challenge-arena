export type CategoryId =
  | 'history' | 'geography' | 'science' | 'general' | 'art' | 'cinema' | 'sports'
  | 'kids' | 'license' | 'medical' | 'economy' | 'turkey' | 'fun' | 'mixed'
  | 'arabic' | 'french' | 'german' | 'spanish' | 'english';

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
  { id: 'history',   name: 'Tarih',          shortName: 'Tarih',    icon: '🏺', color: '#c0392b', group: 'culture',  description: 'Osmanlı\'dan Cumhuriyet\'e, dünya tarihinden önemli olaylar.',        questionCount: 500 },
  { id: 'geography', name: 'Coğrafya',        shortName: 'Coğrafya', icon: '🌍', color: '#27ae60', group: 'culture',  description: 'Ülkeler, başkentler, dağlar, nehirler ve daha fazlası.',              questionCount: 618 },
  { id: 'science',   name: 'Bilim',           shortName: 'Bilim',    icon: '🔬', color: '#2980b9', group: 'culture',  description: 'Fizik, kimya, biyoloji ve evren hakkında sorular.',                  questionCount: 618 },
  { id: 'general',   name: 'Genel Kültür',    shortName: 'Genel',    icon: '💡', color: '#8e44ad', group: 'culture',  description: 'Her konudan karışık sorular — klasik bilgi yarışması tarzı!',       questionCount: 501 },
  { id: 'art',       name: 'Sanat',           shortName: 'Sanat',    icon: '🎨', color: '#e67e22', group: 'culture',  description: 'Resim, müzik, edebiyat ve mimariden sorular.',                       questionCount: 200 },
  { id: 'cinema',    name: 'Sinema & TV',     shortName: 'Sinema',   icon: '🎬', color: '#e91e8c', group: 'culture',  description: 'Türk dizileri, dünya filmleri, Oscar ödülleri ve aktörler.',         questionCount: 500 },
  { id: 'sports',    name: 'Spor',            shortName: 'Spor',     icon: '⚽', color: '#16a085', group: 'culture',  description: 'Futbol, olimpiyatlar, Türk sporcular ve dünya rekorları.',           questionCount: 502 },

  { id: 'mixed',     name: 'Karışık',        shortName: 'Karışık', icon: '🎲', color: '#6c3aed', group: 'special',  description: 'Tüm kategorilerden rastgele sorular — her soru farklı bir konudan!',   questionCount: 3000 },

  // Özel Kategoriler
  { id: 'turkey',    name: 'Türkiye',        shortName: 'Türkiye', icon: '🇹🇷', color: '#dc2626', group: 'special',  description: 'Türk tarihi, kültürü, coğrafyası ve güncel Türkiye hakkında.',       questionCount: 232 },
  { id: 'fun',       name: 'Eğlence',        shortName: 'Eğlence', icon: '🎉', color: '#f97316', group: 'special',  description: 'İlginç gerçekler, pop kültür, komik bilgiler ve sürpriz sorular!',   questionCount: 200 },
  { id: 'kids',      name: 'Çocuklar İçin',  shortName: 'Çocuk',   icon: '🧒', color: '#ff6b9d', group: 'special',  description: 'Eğlenceli ve kolay sorular — 8-14 yaş için!',                        questionCount: 200 },
  { id: 'license',   name: 'Ehliyet Sınavı', shortName: 'Ehliyet', icon: '🚗', color: '#555555', group: 'special',  description: 'Trafik kuralları ve ehliyet sınav soruları.',                         questionCount: 200 },
  { id: 'medical',   name: 'Tıbbi Terimler', shortName: 'Tıp',     icon: '🩺', color: '#e74c3c', group: 'special',  description: 'Hastalık adları, organ isimleri ve tıp terimleri.',                   questionCount: 500 },
  { id: 'economy',   name: 'Ekonomi',        shortName: 'Ekonomi', icon: '📈', color: '#2ecc71', group: 'special',  description: 'Finans, borsa, ekonomi kavramları ve Türkiye ekonomisi.',             questionCount: 200 },

  // Dil Öğren
  { id: 'english',   name: 'İngilizce',      shortName: 'İngilizce',icon: '🇬🇧', color: '#0055a4', group: 'language', description: 'En çok kullanılan İngilizce kelimeler, anlamları ve kullanımları.', questionCount: 300 },
  { id: 'arabic',    name: 'Arapça',         shortName: 'Arapça',  icon: '🇸🇦', color: '#1a5276', group: 'language', description: 'Temel Arapça kelimeler, sayılar ve günlük kullanım.',                 questionCount: 100 },
  { id: 'french',    name: 'Fransızca',      shortName: 'Fransız', icon: '🇫🇷', color: '#1a5276', group: 'language', description: 'Temel Fransızca kelimeler ve günlük ifadeler.',                       questionCount: 100 },
  { id: 'german',    name: 'Almanca',        shortName: 'Almanca', icon: '🇩🇪', color: '#1a5276', group: 'language', description: 'Temel Almanca kelimeler ve yaygın kullanım.',                        questionCount: 100 },
  { id: 'spanish',   name: 'İspanyolca',     shortName: 'İspanyol',icon: '🇪🇸', color: '#1a5276', group: 'language', description: 'Temel İspanyolca kelimeler ve günlük ifadeler.',                     questionCount: 100 },
];

export function getCategoriesByGroup(group: GroupId): CategoryConfig[] {
  return CATEGORIES.filter((c) => c.group === group);
}
