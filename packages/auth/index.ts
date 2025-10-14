/**
 * 🔐 AUTH PACKAGE - Sistema de Autenticación Unificado
 * 
 * Maneja autenticación JWT + OAuth2 para todas las apps
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'tester';
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  permissions: string[];
  alvaeSymbol?: boolean; // Solo admins/testers
  createdAt: string;
  updatedAt: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: User['role'];
  tier: User['tier'];
  permissions: string[];
  alvaeSymbol?: boolean;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface OAuthProvider {
  id: 'google' | 'facebook' | 'tiktok';
  name: string;
  icon: string;
  clientId: string;
  redirectUri: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  nexusMode: boolean;
  error: string | null;
}

export interface AuthActions {
  // Auth methods
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // OAuth methods
  loginWithOAuth: (provider: OAuthProvider['id']) => Promise<void>;
  handleOAuthCallback: (code: string, state: string) => Promise<void>;
  
  // User management
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  
  // Nexus mode
  activateNexus: () => void;
  deactivateNexus: () => void;
  
  // Utility
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

// OAuth Providers Configuration
export const OAUTH_PROVIDERS: OAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: '🔍',
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/google/callback`
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    clientId: process.env.FACEBOOK_CLIENT_ID || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/facebook/callback`
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    clientId: process.env.TIKTOK_CLIENT_ID || '',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/tiktok/callback`
  }
];

// Permission constants
export const PERMISSIONS = {
  // Music generation
  GENERATE_MUSIC: 'generate:music',
  GENERATE_LYRICS: 'generate:lyrics',
  DOWNLOAD_AUDIO: 'download:audio',
  
  // DAW features
  CREATE_PROJECT: 'create:project',
  COLLABORATE: 'collaborate:project',
  EXPORT_PROJECT: 'export:project',
  
  // Social features
  CHAT_MESSAGE: 'chat:message',
  CREATE_ROOM: 'chat:create_room',
  MODERATE_CHAT: 'chat:moderate',
  
  // Marketing
  SCHEDULE_POST: 'marketing:schedule',
  ANALYTICS_VIEW: 'marketing:analytics',
  
  // Admin features
  ADMIN_PANEL: 'admin:panel',
  MANAGE_USERS: 'admin:users',
  SYSTEM_CONFIG: 'admin:config',
  
  // Nexus mode
  NEXUS_ACTIVATE: 'nexus:activate'
} as const;

// Tier permissions mapping
export const TIER_PERMISSIONS: Record<User['tier'], string[]> = {
  free: [
    PERMISSIONS.GENERATE_MUSIC,
    PERMISSIONS.DOWNLOAD_AUDIO,
    PERMISSIONS.CHAT_MESSAGE
  ],
  starter: [
    PERMISSIONS.GENERATE_MUSIC,
    PERMISSIONS.GENERATE_LYRICS,
    PERMISSIONS.DOWNLOAD_AUDIO,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.CHAT_MESSAGE,
    PERMISSIONS.SCHEDULE_POST
  ],
  pro: [
    PERMISSIONS.GENERATE_MUSIC,
    PERMISSIONS.GENERATE_LYRICS,
    PERMISSIONS.DOWNLOAD_AUDIO,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.COLLABORATE,
    PERMISSIONS.EXPORT_PROJECT,
    PERMISSIONS.CHAT_MESSAGE,
    PERMISSIONS.CREATE_ROOM,
    PERMISSIONS.SCHEDULE_POST,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.NEXUS_ACTIVATE
  ],
  enterprise: [
    // All permissions
    ...Object.values(PERMISSIONS)
  ]
};

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<User['role'], string[]> = {
  user: [], // Uses tier permissions
  admin: [
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.MODERATE_CHAT,
    PERMISSIONS.NEXUS_ACTIVATE
  ],
  tester: [
    PERMISSIONS.NEXUS_ACTIVATE,
    PERMISSIONS.ADMIN_PANEL
  ]
};

// Utility functions
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  
  const tierPermissions = TIER_PERMISSIONS[user.tier] || [];
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  
  return tierPermissions.includes(permission) || 
         rolePermissions.includes(permission) ||
         user.permissions.includes(permission);
}

export function canActivateNexus(user: User | null): boolean {
  return hasPermission(user, PERMISSIONS.NEXUS_ACTIVATE) || 
         user?.alvaeSymbol === true;
}

export function getTierLimits(tier: User['tier']) {
  const limits = {
    free: {
      dailyGenerations: 3,
      monthlyGenerations: 50,
      maxProjectDuration: 30, // seconds
      maxProjects: 1,
      chatRooms: 1
    },
    starter: {
      dailyGenerations: 10,
      monthlyGenerations: 200,
      maxProjectDuration: 120,
      maxProjects: 5,
      chatRooms: 3
    },
    pro: {
      dailyGenerations: 50,
      monthlyGenerations: 1000,
      maxProjectDuration: 300,
      maxProjects: 20,
      chatRooms: 10
    },
    enterprise: {
      dailyGenerations: -1, // unlimited
      monthlyGenerations: -1,
      maxProjectDuration: -1,
      maxProjects: -1,
      chatRooms: -1
    }
  };
  
  return limits[tier];
}
