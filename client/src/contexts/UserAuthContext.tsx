import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { customFetch } from '@/api/custom-fetch';

export interface AuthUser {
  id: string;
  username: string;
  displayName?: string;
  role: 'user' | 'admin';
}

interface UserAuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  /** Stable UUID for guests, stored in localStorage */
  guestId: string;
}

const UserAuthContext = createContext<UserAuthContextValue | null>(null);

function createGuestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const randomValues = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(randomValues);
  } else {
    for (let index = 0; index < randomValues.length; index += 1) {
      randomValues[index] = Math.floor(Math.random() * 256);
    }
  }

  randomValues[6] = (randomValues[6] & 0x0f) | 0x40;
  randomValues[8] = (randomValues[8] & 0x3f) | 0x80;

  return Array.from(randomValues, (value, index) => {
    const separator = index === 4 || index === 6 || index === 8 || index === 10 ? '-' : '';
    return `${separator}${value.toString(16).padStart(2, '0')}`;
  }).join('');
}

function getOrCreateGuestId(): string {
  const key = 'blog_guest_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = createGuestId();
    localStorage.setItem(key, id);
  }
  return id;
}

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestId] = useState(() => getOrCreateGuestId());

  const refresh = useCallback(async () => {
    try {
      const data = await customFetch<{ user: AuthUser | null }>('/api/users/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await customFetch('/api/users/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return (
    <UserAuthContext.Provider value={{ user, loading, refresh, logout, guestId }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be inside UserAuthProvider');
  return ctx;
}
