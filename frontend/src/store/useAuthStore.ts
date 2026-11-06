import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginPayload, RegisterPayload } from '../types/user';
import { authService } from '../services/auth.service';
import { setCookie } from '../utils/cookie';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  sendOtp: (emailAddress: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      
      login: async (payload: LoginPayload) => {
        const res = await authService.login(payload);
        if (res.token) {
          setCookie('syncstream-token', res.token, 7);
          localStorage.setItem('syncstream-token', res.token);
        }
        if (res.user) {
          localStorage.setItem('syncstream-user', JSON.stringify(res.user));
          set({ user: res.user });
        }
      },

      sendOtp: async (emailAddress: string) => {
        await authService.sendOtp(emailAddress);
      },
      
      register: async (payload: RegisterPayload) => {
        await authService.register(payload);
      },
      
      logout: () => {
        authService.logout();
        set({ user: null });
      },
      
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            set({ user: currentUser });
          }
        } catch (error) {
          console.error('Failed to load user', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // only persist user, not isLoading
    }
  )
);
