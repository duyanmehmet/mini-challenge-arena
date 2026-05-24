import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CategoryId } from '../constants/categories';
import type { QuizQuestion } from '../types/quiz';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function storageKey(categoryId: CategoryId): string {
  return `seen_q_${categoryId}_${todayStr()}`;
}

function qId(q: QuizQuestion): string {
  return q.q.slice(0, 60);
}

export const seenQuestionsService = {
  async getSeenIds(categoryId: CategoryId): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(storageKey(categoryId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async markBatchAsSeen(categoryId: CategoryId, questions: QuizQuestion[]): Promise<void> {
    try {
      const existing = await this.getSeenIds(categoryId);
      const merged = [...new Set([...existing, ...questions.map(qId)])];
      await AsyncStorage.setItem(storageKey(categoryId), JSON.stringify(merged));
    } catch {}
  },

  // Bir önceki günün kayıtlarını temizle (uygulama başlangıcında çağrılabilir)
  async clearOldEntries(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const today = todayStr();
      const old = (keys as string[]).filter(k => k.startsWith('seen_q_') && !k.includes(`_${today}`));
      if (old.length > 0) await AsyncStorage.multiRemove(old);
    } catch {}
  },
};
