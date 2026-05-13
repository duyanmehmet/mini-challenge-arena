export interface BadgeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGES: BadgeConfig[] = [
  // Genel
  { id: 'first_game',        name: 'İlk Adım',          icon: '🎯', description: 'İlk oyununu tamamla'                    },
  { id: 'streak_3',          name: '3 Gün Serisi',       icon: '🔥', description: '3 gün üst üste oyna'                    },
  { id: 'streak_7',          name: '7 Gün Serisi',       icon: '🔥', description: '7 gün üst üste oyna'                    },
  { id: 'streak_30',         name: 'Aylık Seri',         icon: '💎', description: '30 gün üst üste oyna'                   },
  { id: 'level_10',          name: 'Usta',               icon: '⭐', description: '10. seviyeye ulaş'                      },
  { id: 'level_25',          name: 'Uzman',              icon: '🌟', description: '25. seviyeye ulaş'                      },
  { id: 'level_50',          name: 'Efsane',             icon: '👑', description: '50. seviyeye ulaş'                      },
  { id: 'weekly_champion',   name: 'Haftalık Şampiyon',  icon: '🏆', description: 'Haftayı lig birincisi bitir'            },
  { id: 'classic_complete',  name: 'Klasik Kahraman',    icon: '🏅', description: 'Klasik Turu tüm sorularla tamamla'      },
  { id: 'duel_winner',       name: 'Düello Efsanesi',    icon: '⚔️', description: 'İlk düellonu kazan'                     },
  // Kategori bazlı
  { id: 'history_master',    name: 'Tarih Uzmanı',       icon: '🏺', description: 'Tarih kategorisinde 1000 puan kazan'    },
  { id: 'science_master',    name: 'Bilim İnsanı',       icon: '🔬', description: 'Bilim kategorisinde 1000 puan kazan'    },
  { id: 'geography_master',  name: 'Kaşif',              icon: '🌍', description: 'Coğrafya kategorisinde 1000 puan kazan' },
  { id: 'general_master',    name: 'Genel Kültür Devi',  icon: '💡', description: 'Genel Kültürde 1500 puan kazan'         },
  { id: 'turkey_master',     name: 'Anadolu Çocuğu',     icon: '🇹🇷', description: 'Türkiye kategorisinde 1000 puan kazan' },
  { id: 'cinema_master',     name: 'Sinefil',            icon: '🎬', description: 'Sinema & TV kategorisinde 1000 puan'    },
  { id: 'sports_master',     name: 'Sporcu',             icon: '⚽', description: 'Spor kategorisinde 1000 puan kazan'     },
  { id: 'art_master',        name: 'Sanat Aşığı',        icon: '🎨', description: 'Sanat kategorisinde 1000 puan kazan'    },
  { id: 'medical_master',    name: 'Tıp Bilgini',        icon: '🩺', description: 'Tıp kategorisinde 800 puan kazan'       },
  { id: 'economy_master',    name: 'Ekonomist',          icon: '📈', description: 'Ekonomi kategorisinde 800 puan kazan'   },
  // Özel
  { id: 'speed_demon',       name: 'Şimşek Hızı',        icon: '⚡', description: '5 soruyu 3 saniyede cevapla'            },
  { id: 'perfect_streak',    name: 'Mükemmel Seri',      icon: '✨', description: '10 soruyu üst üste doğru cevapla'       },
  { id: 'all_categories',    name: 'Tam Set',            icon: '🎮', description: 'Tüm 12 kategoriyi oyna'                 },
];
