/**
 * 🎵 AUTH STORE - GESTIÓN DE AUTENTICACIÓN
 * 
 * Store para manejar el estado de autenticación del usuario
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'premium' | 'pro';
  avatar?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (data: LoginData) => {
        set({ isLoading: true });
        try {
          // Simular llamada a API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Crear usuario simulado
          const user: User = {
            id: `user_${Date.now()}`,
            email: data.email,
            name: data.email.split('@')[0],
            tier: 'free'
          };
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          // Simular llamada a API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Crear usuario simulado
          const user: User = {
            id: `user_${Date.now()}`,
            email: data.email,
            name: data.name,
            tier: 'free'
          };
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // Verificar si hay usuario en localStorage
          const stored = localStorage.getItem('son1kverse-auth');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.state?.user) {
              set({
                user: parsed.state.user,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          }
          
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        } catch (error) {
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'son1kverse-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
