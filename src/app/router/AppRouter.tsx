import {
  lazy,
  Suspense,
  type ReactNode,
} from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { AUTH_ROUTES } from '../../features/auth/constants';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { FICHA_DEUDOR_ROUTES } from '../../features/ficha-deudor/shared/constants/fichaDeudorRoutes.constants';
import { GESTION_USUARIOS_ROUTES } from '../../features/gestion-usuarios/constants/gestionUsuariosRoutes.constants';
import AppLayout from '../../shared/components/layout/AppLayout';
import { GESTION_USUARIOS_FEATURE } from '../../features/gestion-usuarios/constants/gestionUsuariosFeature.constants';
import { FichaDeudorPopupRoute } from '@features/ficha-deudor/shared/popups/FichaDeudorPopupRoute';
import { getAppBreadcrumb } from './appBreadcrumbs';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

const AsignarUsuarioPage = lazy(
  () =>
    import(
      '../../features/gestion-usuarios/pages/AsignarUsuarioPage'
    )
);

const MenuModulosPage = lazy(
  () =>
    import(
      '../../features/menu-modulos/pages/MenuModulosPage'
    )
);

const GestionDeudorPage = lazy(
  () =>
    import(
      '../../features/gestion-deudor/pages/GestionDeudorPage'
    )
);

const FichaDeudor = lazy(
  () =>
    import(
      '../../features/ficha-deudor/pages/FichaDeudor'
    )
);

const CambiarClavePage = lazy(
  () =>
    import(
      '../../features/gestion-usuarios/pages/CambiarClavePage'
    )
);

const MantenerUsuarioPage = lazy(
  () =>
    import(
      '../../features/gestion-usuarios/pages/MantenerUsuarioPage'
    )
);

interface GestionUsuariosFeatureRouteProps {
  children: ReactNode;
}

function GestionUsuariosFeatureRoute({
  children,
}: GestionUsuariosFeatureRouteProps) {
  if (!GESTION_USUARIOS_FEATURE.enabled) {
    return (
      <Navigate
        to={AUTH_ROUTES.MENU_MODULOS}
        replace
      />
    );
  }

  return <>{children}</>;
}

function PageLoader() {
  return <div>Cargando...</div>;
}

function LegacyFichaDeudorRedirect() {
  const location = useLocation();

  return (
    <Navigate
      to={{
        pathname:
          FICHA_DEUDOR_ROUTES
            .FICHA_DEUDOR,
        search: location.search,
      }}
      state={location.state}
      replace
    />
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to={AUTH_ROUTES.LOGIN}
                replace
              />
            }
          />

          <Route element={<PublicRoute />}>
            <Route
              path={AUTH_ROUTES.LOGIN}
              element={<LoginPage />}
            />
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
                path={
                  FICHA_DEUDOR_ROUTES
                    .LEGACY_FICHA_DEUDOR
                }
                element={
                  <LegacyFichaDeudorRedirect />
                }
              />

              <Route
                path={
                  FICHA_DEUDOR_ROUTES.FICHA_DEUDOR
                }
                element={<FichaDeudor />}
              />

              <Route
                path={GESTION_USUARIOS_ROUTES.CAMBIAR_CLAVE}
                element={
                  <GestionUsuariosFeatureRoute>
                    <CambiarClavePage />
                  </GestionUsuariosFeatureRoute>
                }
              />

              <Route
                path={GESTION_USUARIOS_ROUTES.ASIGNAR_USUARIO}
                element={
                  <GestionUsuariosFeatureRoute>
                    <AsignarUsuarioPage />
                  </GestionUsuariosFeatureRoute>
                }
              />

              <Route
                path={GESTION_USUARIOS_ROUTES.MANTENER_USUARIO}
                element={
                  <GestionUsuariosFeatureRoute>
                    <MantenerUsuarioPage />
                  </GestionUsuariosFeatureRoute>
                }
              />

            </Route>

            <Route
              path={FICHA_DEUDOR_ROUTES.POPUP}
              element={<FichaDeudorPopupRoute />}
            />
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to={AUTH_ROUTES.MENU_MODULOS}
                replace
              />
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}