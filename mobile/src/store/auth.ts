import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  mobile: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const KEY = 'dh-mobile-auth';

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  login: async (user, token) => {
    await AsyncStorage.setItem(KEY, JSON.stringify({ user, token }));
    set({ user, token });
  },
  logout: async () => {
    await AsyncStorage.removeItem(KEY);
    set({ user: null, token: null });
  },
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const { user, token } = JSON.parse(raw);
        set({ user, token, hydrated: true });
        return;
      }
    } catch {}
    set({ hydrated: true });
  },
}));
