import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@hooks/useAuth';

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.');
    const payloadPart = parts[1];
    if (!payloadPart) return false;
    const payload = JSON.parse(atob(payloadPart)) as { exp?: unknown };
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token || !isTokenValid(token)) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
  // Note: store hydrates synchronously from localStorage, no async wait needed.
}
