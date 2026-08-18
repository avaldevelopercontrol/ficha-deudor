import { Navigate, Outlet } from 'react-router-dom';

import { AUTH_ROUTES } from '../../features/auth/constants';
import { useAuth } from '../../features/auth/hooks/useAuth';

export function ExpiredPasswordRoute() {
  const { expiredPasswordChallenge } = useAuth();

  if (!expiredPasswordChallenge) {
    return <Navigate to={AUTH_ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
