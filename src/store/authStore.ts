import { create } from 'zustand';
import { AuthState } from '../types/auth.types';
import { setToken as saveTokenToSecureStore, removeToken as deleteTokenFromSecureStore } from '../utils/storage';

interface AuthStore extends AuthState {
  setAuth: (user: AuthState['user'], token: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: async (user, token) => {
    await saveTokenToSecureStore(token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },
  logout: async () => {
    await deleteTokenFromSecureStore();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
