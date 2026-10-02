import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isFirebaseConfigured } from '@/services/firebase/config';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth();

  if (!isFirebaseConfigured) {
    // Allows local demoing of the UI before Firebase env vars are supplied.
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100 dark:bg-canopy-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-canopy-600 border-t-transparent" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
