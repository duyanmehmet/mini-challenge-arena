import type { CategoryId } from '../../constants/categories';
import type { QuizQuestion } from '../../types/quiz';

import history   from './history';
import geography from './geography';
import science   from './science';
import general   from './general';
import art       from './art';
import cinema    from './cinema';
import sports    from './sports';
import kids      from './kids';
import license   from './license';
import medical   from './medical';
import economy   from './economy';
import arabic    from './arabic';
import french    from './french';
import german    from './german';
import spanish   from './spanish';
import english   from './english';
import turkey    from './turkey';

const QUESTION_BANKS: Record<CategoryId, QuizQuestion[]> = {
  history,
  geography,
  science,
  general,
  art,
  cinema,
  sports,
  kids,
  license,
  medical,
  economy,
  arabic,
  french,
  german,
  spanish,
  english,
  turkey,
};

export function getQuestions(categoryId: CategoryId): QuizQuestion[] {
  return QUESTION_BANKS[categoryId] ?? [];
}

// Fisher-Yates — güvenli karıştırma
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getShuffledQuestions(categoryId: CategoryId): QuizQuestion[] {
  return shuffle(getQuestions(categoryId));
}

/**
 * Her oyunda farklı sorular gelir.
 * playCount: kaç kez bu kategoride oynandığı — her oyunda başlangıç noktasını kaydırır.
 * Hem rotasyon hem karıştırma kullanır — soru bankası büyüdükçe çeşitlilik artar.
 */
export function getAdaptiveQuestions(categoryId: CategoryId, playCount: number): QuizQuestion[] {
  const all = getQuestions(categoryId);
  if (all.length === 0) return [];

  // Bankayı 3 zorluk grubuna ayır
  const easy   = shuffle(all.filter(q => (q.d ?? 2) <= 1));
  const medium = shuffle(all.filter(q => (q.d ?? 2) === 2 || (q.d ?? 2) === 3));
  const hard   = shuffle(all.filter(q => (q.d ?? 2) >= 4));

  // Her oyun için: 3 kolay + 5 orta + 2 zor (10 soru lig/duel için ideal)
  // Pool'u rotasyon + shuffle ile seç — playCount ile başlangıcı kaydır
  const BLOCK = 15;
  const offset = (playCount * BLOCK) % Math.max(medium.length, 1);

  const easyPick  = [...easy.slice(offset % Math.max(easy.length, 1)),   ...easy].slice(0, easy.length);
  const medPick   = [...medium.slice(offset), ...medium.slice(0, offset)];
  const hardPick  = [...hard.slice(offset % Math.max(hard.length, 1)),   ...hard].slice(0, hard.length);

  // Tüm soruları karıştır: kolay → orta → zor sıralaması kabaca korunur ama her oyun farklı
  return [...easyPick, ...medPick, ...hardPick];
}

/** Belirli sayıda rastgele soru — düello turları için */
export function getRandomQuestions(categoryId: CategoryId, count: number): QuizQuestion[] {
  return shuffle(getQuestions(categoryId)).slice(0, count);
}

/** Tüm kategorilerden karışık n soru döndürür (Klasik Tur için) */
export function getRandomMixedQuestions(count: number): Array<QuizQuestion & { categoryId: CategoryId }> {
  const all = (Object.entries(QUESTION_BANKS) as [CategoryId, QuizQuestion[]][])
    .flatMap(([catId, qs]) => qs.map((q) => ({ ...q, categoryId: catId })));
  return all.sort(() => Math.random() - 0.5).slice(0, count);
}
