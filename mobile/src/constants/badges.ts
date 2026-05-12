export interface BadgeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGES: BadgeConfig[] = [
  { id: 'first_step',       name: 'İlk Adım',         icon: '🎯', description: 'İlk challengeı tamamla'            },
  { id: 'fast_hands',       name: 'Hızlı Elleri',      icon: '⚡', description: "Refleks'te x5 combo yap"          },
  { id: 'memory_genius',    name: 'Hafıza Dehası',     icon: '🧠', description: "Hafıza'da 5. tura ulaş"           },
  { id: 'scorer',           name: 'Golcü',             icon: '⚽', description: 'Futbolda 10 arka arkaya gol at'   },
  { id: 'word_master',      name: 'Kelime Ustası',     icon: '📝', description: "Kelime'de 6+ harfli kelime bul"  },
  { id: 'eagle_eye',        name: 'Kartal Gözü',       icon: '🦅', description: "Dikkat'te 4. tura ulaş"          },
  { id: 'runner',           name: 'Koşucu',            icon: '🏃', description: "Kaçış'ta 60 saniye hayatta kal"  },
  { id: 'streak_3',         name: '3 Gün Serisi',      icon: '🔥', description: '3 gün üst üste oyna'             },
  { id: 'weekly_champion',  name: 'Haftalık Şampiyon', icon: '🏆', description: 'Haftayı lig birincisi bitir'     },
  { id: 'versatile',        name: 'Çok Yönlü',         icon: '🎮', description: 'Tüm 6 modu oyna'                 },
  { id: 'arena_master',     name: 'Arena Ustası',      icon: '👑', description: "Seviye 50'ye ulaş"               },
];
