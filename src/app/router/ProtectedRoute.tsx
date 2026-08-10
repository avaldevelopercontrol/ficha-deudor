import { Navigate, Outlet } from 'react-router-dom';

import { AUTH_ROUTES } from '../../features/auth/constants';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { hasPrivateRouteAccess } from '../../features/auth/utils';

export function ProtectedRoute() {
  const auth = useAuth();

  if (!hasPrivateRouteAccess(auth)) {
    return <Navigate to={AUTH_ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
