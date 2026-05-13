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
};

export function getQuestions(categoryId: CategoryId): QuizQuestion[] {
  return QUESTION_BANKS[categoryId] ?? [];
}

export function getShuffledQuestions(categoryId: CategoryId): QuizQuestion[] {
  return [...getQuestions(categoryId)].sort(() => Math.random() - 0.5);
}

/** Tüm kategorilerden karışık n soru döndürür (Klasik Tur için) */
export function getRandomMixedQuestions(count: number): Array<QuizQuestion & { categoryId: CategoryId }> {
  const all = (Object.entries(QUESTION_BANKS) as [CategoryId, QuizQuestion[]][])
    .flatMap(([catId, qs]) => qs.map((q) => ({ ...q, categoryId: catId })));
  return all.sort(() => Math.random() - 0.5).slice(0, count);
}
