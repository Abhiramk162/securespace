import Cookies from 'js-cookie';
import { authApi } from './api';
import type { User } from './types';

// ─── Token helpers ────────────────────────────────────────────
export const getToken = (): string | undefined => Cookies.get('ss_token');

export const isAuthenticated = (): boolean => !!getToken();

export const clearAuth = (): void => {
  Cookies.remove('ss_token');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ss_user');
  }
};

// ─── User cache ───────────────────────────────────────────────
export const getCachedUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem('ss_user');
  if (!cached) return null;
  try {
    return JSON.parse(cached) as User;
  } catch {
    return null;
  }
};

export const setCachedUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ss_user', JSON.stringify(user));
  }
};

// ─── Auth helpers ────────────────────────────────────────────
export const fetchCurrentUser = async (): Promise<User | null> => {
  if (!isAuthenticated()) return null;
  try {
    const user = await authApi.me();
    setCachedUser(user);
    return user;
  } catch {
    clearAuth();
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await authApi.logout();
  } finally {
    clearAuth();
    window.location.href = '/';
  }
};

// ─── Password strength ────────────────────────────────────────
export interface PasswordStrength {
  score: number; // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  feedback: string[];
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++; else feedback.push('Use at least 8 characters');
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++; else feedback.push('Add uppercase letters');
  if (/[0-9]/.test(password)) score++; else feedback.push('Add numbers');
  if (/[^A-Za-z0-9]/.test(password)) score++; else feedback.push('Add special characters');
  if (/[a-z]/.test(password)) {} else feedback.push('Add lowercase letters');

  const capped = Math.min(score, 4);

  const labels: PasswordStrength['label'][] = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['#EF4444', '#F97316', '#EAB308', '#20B486', '#48C8D5'];

  return {
    score: capped,
    label: labels[capped],
    color: colors[capped],
    feedback,
  };
};

// ─── Route guards ─────────────────────────────────────────────
export const requireAuth = (currentPath: string): string | null => {
  if (!isAuthenticated()) {
    return `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
  return null;
};

export const redirectIfAuthed = (): string | null => {
  if (isAuthenticated()) return '/dashboard';
  return null;
};
