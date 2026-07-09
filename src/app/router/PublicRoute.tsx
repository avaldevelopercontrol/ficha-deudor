import { Navigate, Outlet } from 'react-router-dom';
import { AUTH_ROUTES } from '../../features/auth/constants';
import { useAuth } from '../../features/auth/contexts/authContextValue';

export function PublicRoute() {
  const { usuario, clienteSeleccionada } = useAuth();

  if (usuario && clienteSeleccionada) {
    return <Navigate to={AUTH_ROUTES.MENU_MODULOS} replace />;
  }

  return <Outlet />;
}