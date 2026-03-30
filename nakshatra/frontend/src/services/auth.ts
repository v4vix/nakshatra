/**
 * Auth API client for Nakshatra
 * All calls use credentials: 'include' for session cookie transport
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  role: 'user' | 'admin';
  tier: 'free' | 'pro' | 'guru';
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  birthLat?: number;
  birthLon?: number;
  level: number;
  xp: number;
  streakDays: number;
  longestStreak: number;
  lastActivityDate: string | null;
  achievements: string[];
  completedChallenges: string[];
  onboardingComplete: boolean;
  createdAt: string;
}

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await api<{ user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return data.user;
}

export async function register(params: {
  username: string;
  email: string;
  password: string;
  fullName: string;
}): Promise<AuthUser> {
  const data = await api<{ user: AuthUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return data.user;
}

export async function logout(): Promise<void> {
  await api('/auth/logout', { method: 'POST' });
}

export async function getMe(): Promise<AuthUser | null> {
  try {
    const data = await api<{ user: AuthUser }>('/auth/me');
    return data.user;
  } catch {
    return null;
  }
}

export async function updateProfile(updates: Partial<{
  fullName: string;
  avatar: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  birthLat: number;
  birthLon: number;
  onboardingComplete: boolean;
}>): Promise<AuthUser> {
  const data = await api<{ user: AuthUser }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.user;
}

// Share cards
export async function saveShareCard(card: { type: string; title: string; data: Record<string, unknown> }) {
  return api<{ id: string; slug: string; url: string }>('/share/cards', {
    method: 'POST',
    body: JSON.stringify(card),
  });
}

export async function getMyShareCards() {
  return api<{ cards: Array<{ id: string; type: string; title: string; data: any; slug: string; url: string; createdAt: string }> }>('/share/cards');
}

export async function getPublicCard(slug: string) {
  const res = await fetch(`${API_BASE}/share/cards/${slug}`, { credentials: 'include' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.card;
}

export async function deleteShareCard(id: string) {
  return api('/share/cards/' + id, { method: 'DELETE' });
}

// Admin
export async function getAdminUsers() {
  return api<{ users: any[] }>('/admin/users');
}

export async function updateAdminUser(id: string, updates: { tier?: string; role?: string }) {
  return api('/admin/users/' + id, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function deleteAdminUser(id: string) {
  return api('/admin/users/' + id, { method: 'DELETE' });
}

export async function getAdminAnalytics() {
  return api<{ analytics: any }>('/admin/analytics');
}

export async function getAdminSettings() {
  return api<{ settings: Record<string, string> }>('/admin/settings');
}

export async function updateAdminSettings(settings: Record<string, string>) {
  return api('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
}
