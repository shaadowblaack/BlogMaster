import { ReactNode, useEffect, useState } from 'react';
import AdminLogin from '@/pages/AdminLogin';

interface AdminGuardProps {
  children: ReactNode;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/user', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setIsAuthenticated(!!data?.user))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const refetch = () => {
    fetch('/api/auth/user', { credentials: 'include' })
      .then((r) => r.json())
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
