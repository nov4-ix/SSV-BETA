/**
 * 🔐 AUTH STORE - Zustand Store para Autenticación
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AuthStore, 
  User, 
  AuthTokens, 
  LoginRequest, 
  RegisterRequest,
  OAUTH_PROVIDERS,
  hasPermission,
  canActivateNexus
} from '../auth';

// Auth service (mock - will be replaced with real API)
class AuthService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  async login(credentials: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    // Implementation for logout
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Profile update failed');
    }

    return response.json();
  }
}

const authService = new AuthService();

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isLoading: false,
      isAuthenticated: false,
      nexusMode: false,
      error: null,

      // Auth methods
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, tokens } = await authService.login(credentials);
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed'
          });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, tokens } = await authService.register(data);
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed'
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            nexusMode: false,
            isLoading: false,
            error: null
          });
        }
      },

      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) return;

        try {
          const newTokens = await authService.refreshToken(tokens.refreshToken);
          set({ tokens: newTokens });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
        }
      },

      // OAuth methods
      loginWithOAuth: async (provider: 'google' | 'facebook' | 'tiktok') => {
        const oauthProvider = OAUTH_PROVIDERS.find(p => p.id === provider);
        if (!oauthProvider) {
          throw new Error(`OAuth provider ${provider} not configured`);
        }

        // Redirect to OAuth provider
        const authUrl = `${oauthProvider.redirectUri}?client_id=${oauthProvider.clientId}`;
        window.location.href = authUrl;
      },

      handleOAuthCallback: async (code: string, state: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${authService.baseUrl}/api/auth/oauth/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, state })
          });

          if (!response.ok) {
            throw new Error('OAuth callback failed');
          }

          const { user, tokens } = await response.json();
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'OAuth authentication failed'
          });
          throw error;
        }
      },

      // User management
      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (!user) throw new Error('Not authenticated');

        set({ isLoading: true, error: null });
        
        try {
          const updatedUser = await authService.updateProfile(data);
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Profile update failed'
          });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${authService.baseUrl}/api/auth/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
          });

          if (!response.ok) {
            throw new Error('Password change failed');
          }

          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Password change failed'
          });
          throw error;
        }
      },

      deleteAccount: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${authService.baseUrl}/api/auth/account`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            throw new Error('Account deletion failed');
          }

          // Logout after successful deletion
          get().logout();
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Account deletion failed'
          });
          throw error;
        }
      },

      // Nexus mode
      activateNexus: () => {
        const { user } = get();
        
        if (!canActivateNexus(user)) {
          set({ error: 'You do not have permission to activate Nexus mode' });
          return;
        }

        set({ nexusMode: true });
        
        // Auto-deactivate after 1 minute
        setTimeout(() => {
          get().deactivateNexus();
        }, 60000);
      },

      deactivateNexus: () => {
        set({ nexusMode: false });
      },

      // Utility
      checkAuth: async () => {
        const { tokens } = get();
        if (!tokens?.accessToken) return;

        set({ isLoading: true });
        
        try {
          const response = await fetch(`${authService.baseUrl}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${tokens.accessToken}`
            }
          });

          if (response.ok) {
            const user = await response.json();
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            // Token invalid, try refresh
            await get().refreshToken();
          }
        } catch (error) {
          set({ isLoading: false });
          // If check fails, logout user
          get().logout();
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Selectors for common use cases
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useNexusMode = () => useAuthStore(state => state.nexusMode);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);

// Permission hooks
export const useHasPermission = (permission: string) => {
  const user = useUser();
  return hasPermission(user, permission);
};

export const useCanActivateNexus = () => {
  const user = useUser();
  return canActivateNexus(user);
};
