import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  get: async <T>(key: string): Promise<T | null> => {
    const val = await AsyncStorage.getItem(key);
    if (!val) return null;
    try { return JSON.parse(val) as T; } catch { return val as unknown as T; }
  },

  set: async (key: string, value: any): Promise<void> => {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, str);
  },

  remove: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};
