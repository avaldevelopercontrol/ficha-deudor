import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { getAppBreadcrumb } from './appBreadcrumbs';
import { AUTH_ROUTES } from '../../features/auth/constants';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { FICHA_DEUDOR_ROUTES } from '../../features/ficha-deudor/shared/constants/fichaDeudorRoutes.constants';
import AppLayout from '../../shared/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { FichaDeudorPopupRoute } from '@features/ficha-deudor/shared/popups/FichaDeudorPopupRoute';

const MenuModulosPage = lazy(
  () => import('../../features/menu-modulos/pages/MenuModulosPage')
);

const GestionDeudorPage = lazy(
  () => import('../../features/gestion-deudor/pages/GestionDeudorPage')
);

const FichaDeudor = lazy(
  () => import('../../features/ficha-deudor/pages/FichaDeudor')
);

function PageLoader() {
  return <div>Cargando...</div>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to={AUTH_ROUTES.LOGIN} replace />} />

          <Route element={<PublicRoute />}>
            <Route path={AUTH_ROUTES.LOGIN} element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <AppLayout
                  resolveBreadcrumb={getAppBreadcrumb}
                  withoutSidebarPaths={[
                    AUTH_ROUTES.MENU_MODULOS,
                    FICHA_DEUDOR_ROUTES.FICHA_DEUDOR,
                  ]}
                />
              }
            >
              <Route
                path={AUTH_ROUTES.MENU_MODULOS}
                element={<MenuModulosPage />}
              />

              <Route
                path={AUTH_ROUTES.GESTION_DEUDOR}
                element={<GestionDeudorPage />}
              />

              <Route
                path={FICHA_DEUDOR_ROUTES.FICHA_DEUDOR}
                element={<FichaDeudor />}
              />
            </Route>

            <Route
              path={FICHA_DEUDOR_ROUTES.POPUP}
              element={<FichaDeudorPopupRoute />}
            />
          </Route>

          <Route
            path="*"
            element={<Navigate to={AUTH_ROUTES.MENU_MODULOS} replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}