import { ReactNode, useEffect, useState } from 'react';
import AdminLogin from '@/pages/AdminLogin';
import { customFetch } from '@/api/custom-fetch';

interface AdminGuardProps {
  children: ReactNode;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    customFetch<{ user: unknown } | null>('/api/auth/user')
      .then((data) => setIsAuthenticated(!!data?.user))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const refetch = () => {
    customFetch<{ user: unknown } | null>('/api/auth/user')
      .then((data) => setIsAuthenticated(!!data?.user))
      .catch(() => setIsAuthenticated(false));
  };

  return { isAuthenticated, refetch };
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, refetch } = useAdminAuth();

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={refetch} />;
  }

  return <>{children}</>;
}
