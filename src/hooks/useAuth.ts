import { create } from 'zustand';

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    if (!payload) return null;
    return JSON.parse(atob(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 <= Date.now();
}

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === 'auth_token' && e.newValue === null) {
        set({ token: null });
      }
    });
  }

  return {
    token: localStorage.getItem('auth_token'),
    setToken: (token) => {
      localStorage.setItem('auth_token', token);
      set({ token });
    },
    logout: () => {
      localStorage.removeItem('auth_token');
      set({ token: null });
    },
    isAuthenticated: () => !!get().token,
    isTokenExpired: () => isTokenExpired(get().token),
  };
});
