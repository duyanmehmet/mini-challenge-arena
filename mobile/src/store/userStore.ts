import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, PersonalBest, DailyTask } from '../types/user.types';

interface UserState {
  user: User | null;
  token: string | null;
  badges: string[];
  personalBests: PersonalBest[];
  dailyTasks: DailyTask[];
  isAuthenticated: boolean;
  categoryPlayCounts: Record<string, number>; // kaç kez oynandı → rotasyon için
  setUser: (user: User, token: string) => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
  logout: () => Promise<void>;
  addCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  setBadges: (badges: string[]) => void;
  setPersonalBests: (pbs: PersonalBest[]) => void;
  setDailyTasks: (tasks: DailyTask[]) => void;
  loadAuth: () => Promise<void>;
  incrementCategoryPlayCount: (categoryId: string) => void;
}

const XP_THRESHOLDS = [0,100,250,500,1000,1500,2500,4000,6000,10000,15000,25000,40000,60000,80000,100000];

function calculateLevel(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function normalizeUser(raw: any): User {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    avatarId: raw.avatar_id ?? raw.avatarId ?? 1,
    coins: raw.coins ?? 100,
    xp: raw.xp ?? 0,
    level: raw.level ?? 1,
    currentLeague: raw.current_league ?? raw.currentLeague ?? 'bronze',
    weeklyScore: raw.weekly_score ?? raw.weeklyScore ?? 0,
    isPremium: Boolean(raw.is_premium ?? raw.isPremium),
    streakCount: raw.streak_count ?? raw.streakCount ?? 0,
    maxStreak: raw.max_streak ?? raw.maxStreak ?? 0,
    unlockedAvatars: raw.unlockedAvatars ?? [1, 2, 3],
  };
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: null,
  badges: [],
  personalBests: [],
  dailyTasks: [],
  isAuthenticated: false,
  categoryPlayCounts: {},

  setUser: async (user, token) => {
    const normalized = normalizeUser(user);
    set({ user: normalized, token, isAuthenticated: true });
    await Promise.all([
      AsyncStorage.setItem('token', token),
      AsyncStorage.setItem('user', JSON.stringify(normalized)),
    ]);
  },

  updateUser: (partial) => {
    const user = get().user;
    if (!user) return;
    const updated = { ...user, ...partial };
    set({ user: updated });
    AsyncStorage.setItem('user', JSON.stringify(updated));
  },

  logout: async () => {
    set({ user: null, token: null, isAuthenticated: false, badges: [], personalBests: [], dailyTasks: [] });
    await Promise.all([
      AsyncStorage.removeItem('token'),
      AsyncStorage.removeItem('user'),
    ]);
  },

  addCoins: (amount) => {
    const user = get().user;
    if (!user) return;
    const updated = { ...user, coins: Math.max(0, user.coins + amount) };
    set({ user: updated });
    AsyncStorage.setItem('user', JSON.stringify(updated));
  },

  addXP: (amount) => {
    const user = get().user;
    if (!user) return;
    const newXP = user.xp + amount;
    const newLevel = calculateLevel(newXP);
    const updated = { ...user, xp: newXP, level: newLevel };
    set({ user: updated });
    AsyncStorage.setItem('user', JSON.stringify(updated));
  },

  setBadges: (badges) => set({ badges }),
  setPersonalBests: (pbs) => set({ personalBests: pbs }),
  setDailyTasks: (tasks) => set({ dailyTasks: tasks }),

  incrementCategoryPlayCount: (categoryId) => {
    const counts = { ...get().categoryPlayCounts };
    counts[categoryId] = (counts[categoryId] ?? 0) + 1;
    set({ categoryPlayCounts: counts });
    AsyncStorage.setItem('categoryPlayCounts', JSON.stringify(counts));
  },

  loadAuth: async () => {
    const [token, userJson] = await Promise.all([
      AsyncStorage.getItem('token'),
      AsyncStorage.getItem('user'),
    ]);
    const countsJson = await AsyncStorage.getItem('categoryPlayCounts');
    if (countsJson) {
      try { set({ categoryPlayCounts: JSON.parse(countsJson) }); } catch {}
    }
    if (token && userJson) {
      try {
        const raw = JSON.parse(userJson);
        set({ token, user: normalizeUser(raw), isAuthenticated: true });
      } catch {
        await AsyncStorage.multiRemove(['token', 'user']);
      }
    }
  },
}));