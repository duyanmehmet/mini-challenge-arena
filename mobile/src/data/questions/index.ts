import type { CategoryId } from '../../constants/categories';
import type { QuizQuestion } from '../../types/quiz';

import history   from './history';
import geography from './geography';
import science   from './science';
import general   from './general';
import art       from './art';
import cinema    from './cinema';
import sports    from './sports';
import turkey    from './turkey';
import kids      from './kids';
import license   from './license';
import medical   from './medical';
import economy   from './economy';
import arabic    from './arabic';
import french    from './french';
import german    from './german';
import spanish   from './spanish';

const QUESTION_BANKS: Record<CategoryId, QuizQuestion[]> = {
  history,
  geography,
  science,
  general,
  art,
  cinema,
  sports,
  turkey,
  kids,
  license,
  medical,
  economy,
  arabic,
  french,
  german,
  spanish,
};

export function getQuestions(categoryId: CategoryId): QuizQuestion[] {
  return QUESTION_BANKS[categoryId] ?? [];
}

export function getShuffledQuestions(categoryId: CategoryId): QuizQuestion[] {
  return [...getQuestions(categoryId)].sort(() => Math.random() - 0.5);
}

/**
 * Rotasyon tabanlı adaptif soru seçimi.
 * Her oyunda farklı bir grup soru öne çıkar — kullanıcı hep yeni sorularla karşılaşır.
 * playCount: kaç kez bu kategoride oynandığı (userStore.categoryPlayCounts[categoryId])
 */
export function getAdaptiveQuestions(categoryId: CategoryId, playCount: number): QuizQuestion[] {
  const all = getQuestions(categoryId);
  if (all.length === 0) return [];

  // Zorluk içinde hafif karıştır (sabit seed yok, her oynayışta biraz farklı)
  const byDifficulty = [...all].sort((a, b) => {
    const diff = (a.d ?? 2) - (b.d ?? 2);
    return diff !== 0 ? diff : Math.random() - 0.5;
  });

  // Her oynayışta başlangıç noktasını kaydır (20 soru atlama)
  const STEP = 20;
  const startIdx = (playCount * STEP) % byDifficulty.length;

  // Rotasyon: startIdx'ten başla, sona ulaşınca başa dön
  return [...byDifficulty.slice(startIdx), ...byDifficulty.slice(0, startIdx)];
}

/** Tüm kategorilerden karışık n soru döndürür (Klasik Tur için) */
export function getRandomMixedQuestions(count: number): Array<QuizQuestion & { categoryId: CategoryId }> {
  const all = (Object.entries(QUESTION_BANKS) as [CategoryId, QuizQuestion[]][])
    .flatMap(([catId, qs]) => qs.map((q) => ({ ...q, categoryId: catId })));
  return all.sort(() => Math.random() - 0.5).slice(0, count);
}
