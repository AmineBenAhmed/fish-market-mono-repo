import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const isSeller = useAuthStore((s) => s.isSeller());

  if (!isAuthenticated || !isSeller) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
