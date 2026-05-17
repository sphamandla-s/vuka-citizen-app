import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface User {
  id: string;
  phone: string;
  name: string;
  neighbourhood: string;
  photoUrl?: string;
  panicPin?: string;
  notificationRadius: number;
  trustedContacts: string[];
  reportsCount: number;
  alertsReceived: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  pendingPhone: string;
  isNewUser: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setPendingPhone: (phone: string) => void;
  setIsNewUser: (v: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  pendingPhone: '',
  isNewUser: false,

  setToken: (token) => {
    set({ token, isAuthenticated: true });
    AsyncStorage.setItem('vuka_token', token);
  },

  setUser: (user) => {
    set({ user });
    AsyncStorage.setItem('vuka_user', JSON.stringify(user));
  },

  setPendingPhone: (phone) => set({ pendingPhone: phone }),
  setIsNewUser: (v) => set({ isNewUser: v }),

  updateUser: (updates) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    set({ user: updated });
    AsyncStorage.setItem('vuka_user', JSON.stringify(updated));
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['vuka_token', 'vuka_user']);
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadFromStorage: async () => {
    try {
      const [token, userStr] = await AsyncStorage.multiGet(['vuka_token', 'vuka_user']);
      const t = token[1];
      const u = userStr[1];
      if (t && u) {
        set({ token: t, user: JSON.parse(u), isAuthenticated: true });
      }
    } catch {
      // ignore
    }
  },
}));
