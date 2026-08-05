import {
  AUTH_ROUTES,
} from '@features/auth/constants';

import {
  GESTION_USUARIOS_FEATURE,
} from '@features/gestion-usuarios/constants/gestionUsuariosFeature.constants';

import {
  GESTION_USUARIOS_ROUTES,
} from '@features/gestion-usuarios/constants/gestionUsuariosRoutes.constants';

import {
  SEGURIDAD_FEATURE,
} from '@features/seguridad/constants/seguridadFeature.constants';

import {
  SEGURIDAD_ROUTES,
} from '@features/seguridad/constants/seguridadRoutes.constants';

interface OptionRouteDefinition {
  readonly path: string;
  readonly enabled: boolean;
}

const OPTION_ROUTE_REGISTRY: Readonly<
  Record<string, OptionRouteDefinition>
> = {
  mGestionDeudor: {
    path: AUTH_ROUTES.GESTION_DEUDOR,
    enabled: true,
  },

  mCambiarClave: {
    path:
      GESTION_USUARIOS_ROUTES
        .CAMBIAR_CLAVE,
    enabled:
      GESTION_USUARIOS_FEATURE
        .enabled,
  },

  mAsignarUsuario: {
    path:
      GESTION_USUARIOS_ROUTES
        .ASIGNAR_USUARIO,
    enabled:
      GESTION_USUARIOS_FEATURE
        .enabled,
  },

  mMantenerUsuario: {
    path:
      GESTION_USUARIOS_ROUTES
        .MANTENER_USUARIO,
    enabled:
      GESTION_USUARIOS_FEATURE
        .enabled,
  },

  mMantenerPerfil: {
    path:
      SEGURIDAD_ROUTES
        .MANTENER_PERFIL,
    enabled:
      SEGURIDAD_FEATURE.enabled,
  },

  mMantenerModulo: {
    path:
      SEGURIDAD_ROUTES
        .MANTENER_MODULOS,
    enabled:
      SEGURIDAD_FEATURE.enabled,
  },

  mMantenerAccesosPorPerfil: {
    path:
      SEGURIDAD_ROUTES
        .MANTENER_ACCESOS_PERFIL,
    enabled:
      SEGURIDAD_FEATURE.enabled,
  },
};

export const getOptionRoute = (
  optionCode: string
): string | null => {
  const definition =
    OPTION_ROUTE_REGISTRY[
      optionCode.trim()
    ];

  if (
    !definition ||
    !definition.enabled
  ) {
    return null;
  }

  return definition.path;
};

export const hasRegisteredOptionRoute = (
  optionCode: string
): boolean =>
  getOptionRoute(optionCode) !== null;
