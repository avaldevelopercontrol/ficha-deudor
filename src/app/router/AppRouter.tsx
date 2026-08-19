import {
  lazy,
  Suspense,
  useCallback,
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
  APPLICATION_OPTION_IDS,
  OptionAccessRoute,
  useAccessControl,
} from '../../features/access-control';

import {
  ANALYTICS_ROUTES,
} from '../../features/analytics/constants/analyticsRoutes.constants';

import {
  REPORTERIA_ROUTES,
} from '../../features/analytics/constants/reporteriaRoutes.constants';

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
  ExpiredPasswordRoute,
} from './ExpiredPasswordRoute';

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

const PortfolioControlCenterPage = lazy(
  () =>
    import(
      '../../features/analytics/pages/PortfolioControlCenterPage'
    )
);

const ReporteriaPage = lazy(
  () =>
    import(
      '../../features/analytics/pages/ReporteriaPage'
    )
);

const PowerBiViewerPage = lazy(
  () =>
    import(
      '../../features/analytics/pages/PowerBiViewerPage'
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

const CambiarClaveExpiradaPage = lazy(
  () =>
    import(
      '../../features/gestion-usuarios/pages/CambiarClaveExpiradaPage'
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

const MantenerGrupoPage = lazy(
  () =>
    import(
      '../../features/seguridad/pages/MantenerGrupoPage'
    )
);

const MantenerAccesosPerfilPage = lazy(
  () =>
    import(
      '../../features/seguridad/pages/MantenerAccesosPerfilPage'
    )
);

const MantenerAccesosUsuarioPage = lazy(
  () =>
    import(
      '../../features/seguridad/pages/MantenerAccesosUsuarioPage'
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

function PrivateAppLayout() {
  const {
    menuTree,
  } = useAccessControl();

  const resolveBreadcrumb =
    useCallback(
      (pathname: string) =>
        getAppBreadcrumb(
          pathname,
          menuTree
        ),
      [menuTree]
    );

  return (
    <AppLayout
      resolveBreadcrumb={
        resolveBreadcrumb
      }
      withoutSidebarPaths={[
        AUTH_ROUTES
          .MENU_MODULOS,

        FICHA_DEUDOR_ROUTES
          .FICHA_DEUDOR,

        REPORTERIA_ROUTES
          .POWER_BI,
      ]}
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

            <Route element={<ExpiredPasswordRoute />}>
              <Route
                path={AUTH_ROUTES.CAMBIAR_CLAVE_EXPIRADA}
                element={<CambiarClaveExpiradaPage />}
              />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <PrivateAppLayout />
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
                  <OptionAccessRoute
                    optionId={
                      APPLICATION_OPTION_IDS
                        .GESTION_DEUDOR
                    }
                  >
                    <GestionDeudorPage />
                  </OptionAccessRoute>
                }
              />

              <Route
                path={
                  ANALYTICS_ROUTES
                    .PORTFOLIO_CONTROL_CENTER
                }
                element={
                  <OptionAccessRoute
                    optionId={
                      APPLICATION_OPTION_IDS
                        .PORTFOLIO_CONTROL_CENTER
                    }
                  >
                    <PortfolioControlCenterPage />
                  </OptionAccessRoute>
                }
              />

              <Route
                path={
                  REPORTERIA_ROUTES
                    .ROOT
                }
                element={
                  <OptionAccessRoute
                    optionId={
                      APPLICATION_OPTION_IDS
                        .REPORTERIA
                    }
                  >
                    <ReporteriaPage />
                  </OptionAccessRoute>
                }
              />

              <Route
                path={
                  REPORTERIA_ROUTES
                    .POWER_BI
                }
                element={
                  <OptionAccessRoute
                    optionId={
                      APPLICATION_OPTION_IDS
                        .REPORTERIA
                    }
                  >
                    <PowerBiViewerPage />
                  </OptionAccessRoute>
                }
              />

              <Route
                path={
                  FICHA_DEUDOR_ROUTES
                    .LEGACY_FICHA_DEUDOR
                }
                element={
                  <OptionAccessRoute
                    optionId={
                      APPLICATION_OPTION_IDS
                        .GESTION_DEUDOR
                    }
                  >
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
                  <OptionAccessRoute
                    optionId={
                      APPLICATION_OPTION_IDS
                        .GESTION_DEUDOR
                    }
                  >
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
                    <OptionAccessRoute
                      optionId={
                        APPLICATION_OPTION_IDS
                          .CAMBIAR_CLAVE
                      }
                    >
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
                    <OptionAccessRoute
                      optionId={
                        APPLICATION_OPTION_IDS
                          .ASIGNAR_USUARIO
                      }
                    >
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
                    <OptionAccessRoute
                      optionId={
                        APPLICATION_OPTION_IDS
                          .MANTENER_USUARIO
                      }
                    >
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
                    <OptionAccessRoute
                      optionId={
                        APPLICATION_OPTION_IDS
                          .MANTENER_PERFIL
                      }
                    >
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
                    <OptionAccessRoute
                      optionId={
                        APPLICATION_OPTION_IDS
                          .MANTENER_MODULO
                      }
                    >
                      <MantenerModulosPage />
                    </OptionAccessRoute>
                  </FeatureRoute>
                }
              />

              <Route
                path={
                  SEGURIDAD_ROUTES
                    .MANTENER_GRUPO
                }
                element={
                  <FeatureRoute
                    enabled={
                      SEGURIDAD_FEATURE
                        .enabled
                    }
                  >
                    <OptionAccessRoute
                      optionId={
                        APPLICATION_OPTION_IDS
                          .MANTENER_GRUPO
                      }
                    >
                      <MantenerGrupoPage />
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
                    <OptionAccessRoute
                      optionId={
                        APPLICATION_OPTION_IDS
                          .MANTENER_ACCESOS_POR_PERFIL
                      }
                    >
                      <MantenerAccesosPerfilPage />
                    </OptionAccessRoute>
                  </FeatureRoute>
                }
              />

              <Route
                path={
                  SEGURIDAD_ROUTES
                    .MANTENER_ACCESOS_USUARIO
                }
                element={
                  <FeatureRoute
                    enabled={
                      SEGURIDAD_FEATURE
                        .enabled
                    }
                  >
                    <OptionAccessRoute
                      optionId={
                        APPLICATION_OPTION_IDS
                          .MANTENER_ACCESOS_POR_USUARIO
                      }
                    >
                      <MantenerAccesosUsuarioPage />
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
                <OptionAccessRoute
                  optionId={
                    APPLICATION_OPTION_IDS
                      .GESTION_DEUDOR
                  }
                >
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
