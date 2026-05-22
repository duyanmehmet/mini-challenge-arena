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
import fun       from './fun';

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
  fun,
};

export function getQuestions(categoryId: CategoryId): QuizQuestion[] {
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
 * Her oyunda farklı sorular — playCount arttıkça başlangıç noktası kayar,
 * peş peşe aynı soru kesinlikle gelmez.
 */
export function getAdaptiveQuestions(categoryId: CategoryId, playCount: number): QuizQuestion[] {
  const all = getQuestions(categoryId);
  if (all.length === 0) return [];

  const easy   = shuffle(all.filter(q => (q.d ?? 2) <= 1));
  const medium = shuffle(all.filter(q => (q.d ?? 2) === 2 || (q.d ?? 2) === 3));
  const hard   = shuffle(all.filter(q => (q.d ?? 2) >= 4));

  const BLOCK  = 15;
  const offset = (playCount * BLOCK) % Math.max(medium.length, 1);

  const easyPick = [...easy.slice(offset % Math.max(easy.length, 1)), ...easy].slice(0, easy.length);
  const medPick  = [...medium.slice(offset), ...medium.slice(0, offset)];
  const hardPick = [...hard.slice(offset % Math.max(hard.length, 1)), ...hard].slice(0, hard.length);

  return dedupeConsecutive([...easyPick, ...medPick, ...hardPick]);
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
