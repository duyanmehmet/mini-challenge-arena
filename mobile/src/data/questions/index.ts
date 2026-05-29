import type { CategoryId } from '../../constants/categories';
import type { QuizQuestion } from '../../types/quiz';
import { seenQuestionsService } from '../../services/seenQuestionsService';

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
import fun       from './fun';

const QUESTION_BANKS: Omit<Record<CategoryId, QuizQuestion[]>, 'mixed'> = {
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
  fun,
};

export function getQuestions(categoryId: CategoryId): QuizQuestion[] {
  if (categoryId === 'mixed') {
    return (Object.entries(QUESTION_BANKS) as [CategoryId, QuizQuestion[]][])
      .flatMap(([, qs]) => qs);
  }
  return QUESTION_BANKS[categoryId] ?? [];
}

// Fisher-Yates
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Peş peşe aynı "konu" (sorunun ilk 10 karakteri) gelmesin
function dedupeConsecutive(arr: QuizQuestion[]): QuizQuestion[] {
  const result = [...arr];
  for (let i = 1; i < result.length; i++) {
    const prev = result[i - 1].q.slice(0, 12);
    const curr = result[i].q.slice(0, 12);
    if (curr === prev) {
      // İlerideki farklı bir soruyla yer değiştir
      const swapIdx = result.findIndex((q, idx) => idx > i && q.q.slice(0, 12) !== prev);
      if (swapIdx !== -1) {
        [result[i], result[swapIdx]] = [result[swapIdx], result[i]];
      }
    }
  }
  return result;
}

export function getShuffledQuestions(categoryId: CategoryId): QuizQuestion[] {
  return dedupeConsecutive(shuffle(getQuestions(categoryId)));
}

/**
 * Kolay → Orta → Zor sıralı, o gün görülen soruları atlayan akıllı soru havuzu.
 * count: kaç soru isteniyor (lig=10, antrenman=N, normal=büyük sayı)
 */
export async function getProgressiveQuestions(
  categoryId: CategoryId,
  count: number,
): Promise<QuizQuestion[]> {
  const all = getQuestions(categoryId);
  if (all.length === 0) return [];

  const seenIds = await seenQuestionsService.getSeenIds(categoryId);
  const seenSet = new Set(seenIds);
  const key = (q: QuizQuestion) => q.q.slice(0, 60);

  const unseen = all.filter(q => !seenSet.has(key(q)));
  // Yeterli görülmemiş soru varsa onu kullan, yoksa tüm havuza dön
  const pool = unseen.length >= Math.ceil(count * 0.5) ? unseen : all;

  const easy   = shuffle(pool.filter(q => (q.d ?? 2) === 1));
  const medium = shuffle(pool.filter(q => (q.d ?? 2) === 2));
  const hard   = shuffle(pool.filter(q => (q.d ?? 2) === 3));

  // Dağılım: %30 kolay, %40 orta, %30 zor
  const easyCount = Math.max(1, Math.round(count * 0.3));
  const hardCount = Math.max(1, Math.round(count * 0.3));
  const medCount  = count - easyCount - hardCount;

  const result: QuizQuestion[] = [
    ...easy.slice(0, easyCount),
    ...medium.slice(0, medCount),
    ...hard.slice(0, hardCount),
  ];

  // Herhangi bir bucket yetersizse geri kalanı diğerlerinden tamamla
  if (result.length < count) {
    const used = new Set(result.map(q => q.q));
    const extra = shuffle([...easy, ...medium, ...hard]).filter(q => !used.has(q.q));
    result.push(...extra.slice(0, count - result.length));
  }

  return dedupeConsecutive(result.slice(0, count));
}

/** Eski kodla uyumluluk — senkron versiyon (görülen soru takibi yok) */
export function getAdaptiveQuestions(categoryId: CategoryId, _playCount: number): QuizQuestion[] {
  const all = getQuestions(categoryId);
  if (all.length === 0) return [];

  const easy   = shuffle(all.filter(q => (q.d ?? 2) === 1));
  const medium = shuffle(all.filter(q => (q.d ?? 2) === 2));
  const hard   = shuffle(all.filter(q => (q.d ?? 2) === 3));

  return dedupeConsecutive([...easy, ...medium, ...hard]);
}

/** Belirli sayıda rastgele soru — düello turları için */
export function getRandomQuestions(categoryId: CategoryId, count: number): QuizQuestion[] {
  return dedupeConsecutive(shuffle(getQuestions(categoryId))).slice(0, count);
}

/** Tüm kategorilerden karışık n soru — Klasik Tur için */
export function getRandomMixedQuestions(count: number): Array<QuizQuestion & { categoryId: CategoryId }> {
  const all = (Object.entries(QUESTION_BANKS) as [CategoryId, QuizQuestion[]][])
    .flatMap(([catId, qs]) => qs.map(q => ({ ...q, categoryId: catId })));
  return dedupeConsecutive(shuffle(all)).slice(0, count) as Array<QuizQuestion & { categoryId: CategoryId }>;
}
