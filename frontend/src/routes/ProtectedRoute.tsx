import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { authSelectors } from '@/modules/auth/application/auth.selectors';
import { PATHS } from '@/config/paths';
import { useCurrentUser } from '@/features/shared/hooks/auth/useCurrentUser';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useSelector(authSelectors.getIsAuthenticated);
  const location = useLocation();
  const { isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <LoadingOverlay 
        message="Vérification de l'authentification" 
        subMessage="Connexion en cours..." 
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={PATHS.auth.login} state={{ from: location }} replace />
    );
  }

  return <>{children}</>;
};
