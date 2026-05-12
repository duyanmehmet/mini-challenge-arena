import type { CategoryId } from '../../constants/categories';
import type { QuizQuestion } from '../../types/quiz';

import history  from './history';
import geography from './geography';
import science  from './science';
import general  from './general';
import art      from './art';
import cinema   from './cinema';
import sports   from './sports';
import german   from './german';
import french   from './french';
import arabic   from './arabic';
import spanish  from './spanish';
import kids     from './kids';
import license  from './license';
import medical  from './medical';
import economy  from './economy';

// İngilizce & Türkçe kendi kaynaklarından üretilir (englishWords + wordHints)
// Burada placeholder olarak boş dizi — QuizMode bunları ayrıca yükler
const english: QuizQuestion[] = [];
const turkish: QuizQuestion[] = [];

const QUESTION_BANKS: Record<CategoryId, QuizQuestion[]> = {
  history,
  geography,
  science,
  general,
  art,
  cinema,
  sports,
  english,
  german,
  french,
  arabic,
  spanish,
  turkish,
  kids,
  license,
  medical,
  economy,
};

export function getQuestions(categoryId: CategoryId): QuizQuestion[] {
  return QUESTION_BANKS[categoryId] ?? [];
}

export function getShuffledQuestions(categoryId: CategoryId): QuizQuestion[] {
  const pool = [...getQuestions(categoryId)];
  return pool.sort(() => Math.random() - 0.5);
}
