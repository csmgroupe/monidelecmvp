import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { authSelectors } from '@/modules/auth/application/auth.selectors';
import { PATHS } from '@/config/paths';
import { useCurrentUser } from '@/features/shared/hooks/auth/useCurrentUser';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ReactNode } from 'react';

interface PublicRouteRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteRouteProps) => {
  const isAuthenticated = useSelector(authSelectors.getIsAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading } = useCurrentUser();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || PATHS.home;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  if (isLoading) {
    return (
      <LoadingOverlay 
        message="Initialisation" 
        subMessage="Préparation de votre session..." 
      />
    );
  }

  return <>{children}</>;
};
