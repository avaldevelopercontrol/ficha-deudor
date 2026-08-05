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

import {
  FichaDeudorPopupRoute,
} from '@app/popups';

import {
  OptionAccessRoute,
} from '../../features/access-control';

import {
  AUTH_ROUTES,
} from '../../features/auth/constants';

import {
  LoginPage,
} from '../../features/auth/pages/LoginPage';

import {
  FICHA_DEUDOR_ROUTES,
} from '../../features/ficha-deudor/shared/constants/fichaDeudorRoutes.constants';

import {
  GESTION_USUARIOS_FEATURE,
} from '../../features/gestion-usuarios/constants/gestionUsuariosFeature.constants';

import {
  GESTION_USUARIOS_ROUTES,
} from '../../features/gestion-usuarios/constants/gestionUsuariosRoutes.constants';

import {
  SEGURIDAD_FEATURE,
} from '../../features/seguridad/constants/seguridadFeature.constants';

import {
  SEGURIDAD_ROUTES,
} from '../../features/seguridad/constants/seguridadRoutes.constants';

import AppLayout from '../../shared/components/layout/AppLayout';

import {
  getAppBreadcrumb,
} from './appBreadcrumbs';

import {
  ProtectedRoute,
} from './ProtectedRoute';

import {
  PublicRoute,
} from './PublicRoute';

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

const AsignarUsuarioPage = lazy(
  () =>
    import(
      '../../features/gestion-usuarios/pages/AsignarUsuarioPage'
    )
);

const MantenerUsuarioPage = lazy(
  () =>
    import(
      '../../features/gestion-usuarios/pages/MantenerUsuarioPage'
    )
);

const MantenerPerfilPage = lazy(
  () =>
    import(
      '../../features/seguridad/pages/MantenerPerfilPage'
    )
);

const MantenerModulosPage = lazy(
  () =>
    import(
      '../../features/seguridad/pages/MantenerModulosPage'
    )
);

const MantenerAccesosPerfilPage = lazy(
  () =>
    import(
      '../../features/seguridad/pages/MantenerAccesosPerfilPage'
    )
);

interface FeatureRouteProps {
  enabled: boolean;
  children: ReactNode;
}

function FeatureRoute({
  enabled,
  children,
}: FeatureRouteProps) {
  if (!enabled) {
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
  return (
    <div role="status">
      Cargando...
    </div>
  );
}

function LegacyFichaDeudorRedirect() {
  const location = useLocation();

  return (
    <Navigate
      to={{
        pathname:
          FICHA_DEUDOR_ROUTES
            .FICHA_DEUDOR,

        search:
          location.search,
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
                  resolveBreadcrumb={
                    getAppBreadcrumb
                  }
                  withoutSidebarPaths={[
                    AUTH_ROUTES
                      .MENU_MODULOS,

                    FICHA_DEUDOR_ROUTES
                      .FICHA_DEUDOR,
                  ]}
                />
              }
            >
              <Route
                path={
                  AUTH_ROUTES
                    .MENU_MODULOS
                }
                element={
                  <MenuModulosPage />
                }
              />

              <Route
                path={
                  AUTH_ROUTES
                    .GESTION_DEUDOR
                }
                element={
                  <OptionAccessRoute optionCode="mGestionDeudor">
                    <GestionDeudorPage />
                  </OptionAccessRoute>
                }
              />

              <Route
                path={
                  FICHA_DEUDOR_ROUTES
                    .LEGACY_FICHA_DEUDOR
                }
                element={
                  <OptionAccessRoute optionCode="mGestionDeudor">
                    <LegacyFichaDeudorRedirect />
                  </OptionAccessRoute>
                }
              />

              <Route
                path={
                  FICHA_DEUDOR_ROUTES
                    .FICHA_DEUDOR
                }
                element={
                  <OptionAccessRoute optionCode="mGestionDeudor">
                    <FichaDeudor />
                  </OptionAccessRoute>
                }
              />

              <Route
                path={
                  GESTION_USUARIOS_ROUTES
                    .CAMBIAR_CLAVE
                }
                element={
                  <FeatureRoute
                    enabled={
                      GESTION_USUARIOS_FEATURE
                        .enabled
                    }
                  >
                    <OptionAccessRoute optionCode="mCambiarClave">
                      <CambiarClavePage />
                    </OptionAccessRoute>
                  </FeatureRoute>
                }
              />

              <Route
                path={
                  GESTION_USUARIOS_ROUTES
                    .ASIGNAR_USUARIO
                }
                element={
                  <FeatureRoute
                    enabled={
                      GESTION_USUARIOS_FEATURE
                        .enabled
                    }
                  >
                    <OptionAccessRoute optionCode="mAsignarUsuario">
                      <AsignarUsuarioPage />
                    </OptionAccessRoute>
                  </FeatureRoute>
                }
              />

              <Route
                path={
                  GESTION_USUARIOS_ROUTES
                    .MANTENER_USUARIO
                }
                element={
                  <FeatureRoute
                    enabled={
                      GESTION_USUARIOS_FEATURE
                        .enabled
                    }
                  >
                    <OptionAccessRoute optionCode="mMantenerUsuario">
                      <MantenerUsuarioPage />
                    </OptionAccessRoute>
                  </FeatureRoute>
                }
              />

              <Route
                path={
                  SEGURIDAD_ROUTES
                    .MANTENER_PERFIL
                }
                element={
                  <FeatureRoute
                    enabled={
                      SEGURIDAD_FEATURE
                        .enabled
                    }
                  >
                    <OptionAccessRoute optionCode="mMantenerPerfil">
                      <MantenerPerfilPage />
                    </OptionAccessRoute>
                  </FeatureRoute>
                }
              />

              <Route
                path={
                  SEGURIDAD_ROUTES
                    .MANTENER_MODULOS
                }
                element={
                  <FeatureRoute
                    enabled={
                      SEGURIDAD_FEATURE
                        .enabled
                    }
                  >
                    <OptionAccessRoute optionCode="mMantenerModulo">
                      <MantenerModulosPage />
                    </OptionAccessRoute>
                  </FeatureRoute>
                }
              />

              <Route
                path={
                  SEGURIDAD_ROUTES
                    .MANTENER_ACCESOS_PERFIL
                }
                element={
                  <FeatureRoute
                    enabled={
                      SEGURIDAD_FEATURE
                        .enabled
                    }
                  >
                    <OptionAccessRoute optionCode="mMantenerAccesosPorPerfil">
                      <MantenerAccesosPerfilPage />
                    </OptionAccessRoute>
                  </FeatureRoute>
                }
              />
            </Route>

            <Route
              path={
                FICHA_DEUDOR_ROUTES
                  .POPUP
              }
              element={
                <OptionAccessRoute optionCode="mGestionDeudor">
                  <FichaDeudorPopupRoute />
                </OptionAccessRoute>
              }
            />
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to={
                  AUTH_ROUTES
                    .MENU_MODULOS
                }
                replace
              />
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
