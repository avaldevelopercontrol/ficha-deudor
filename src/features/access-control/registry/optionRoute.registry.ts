import {
  ANALYTICS_ROUTES,
} from '@features/analytics/constants/analyticsRoutes.constants';

import {
  REPORTERIA_ROUTES,
} from '@features/analytics/constants/reporteriaRoutes.constants';

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

import {
  APPLICATION_OPTION_IDS,
  type ApplicationOptionId,
} from './applicationOptionIds';

export interface ApplicationOptionDefinition {
  /** nId_Opcion persistente en la base de datos. */
  readonly optionId: ApplicationOptionId;

  /** Ruta real del navegador React; no corresponde a sUrlOpcion de la API. */
  readonly path: string;

  readonly enabled: boolean;
}

const APPLICATION_OPTION_REGISTRY:
  readonly ApplicationOptionDefinition[] = [
    {
      optionId:
        APPLICATION_OPTION_IDS
          .PORTFOLIO_CONTROL_CENTER,
      path:
        ANALYTICS_ROUTES
          .PORTFOLIO_CONTROL_CENTER,
      enabled: true,
    },
    {
      optionId:
        APPLICATION_OPTION_IDS
          .REPORTERIA,
      path:
        REPORTERIA_ROUTES
          .ROOT,
      enabled: true,
    },
    {
      optionId:
        APPLICATION_OPTION_IDS
          .GESTION_DEUDOR,
      path: AUTH_ROUTES.GESTION_DEUDOR,
      enabled: true,
    },
    {
      optionId:
        APPLICATION_OPTION_IDS
          .CAMBIAR_CLAVE,
      path:
        GESTION_USUARIOS_ROUTES
          .CAMBIAR_CLAVE,
      enabled:
        GESTION_USUARIOS_FEATURE
          .enabled,
    },
    {
      optionId:
        APPLICATION_OPTION_IDS
          .ASIGNAR_USUARIO,
      path:
        GESTION_USUARIOS_ROUTES
          .ASIGNAR_USUARIO,
      enabled:
        GESTION_USUARIOS_FEATURE
          .enabled,
    },
    {
      optionId:
        APPLICATION_OPTION_IDS
          .MANTENER_USUARIO,
      path:
        GESTION_USUARIOS_ROUTES
          .MANTENER_USUARIO,
      enabled:
        GESTION_USUARIOS_FEATURE
          .enabled,
    },
    {
      optionId:
        APPLICATION_OPTION_IDS
          .MANTENER_PERFIL,
      path:
        SEGURIDAD_ROUTES
          .MANTENER_PERFIL,
      enabled:
        SEGURIDAD_FEATURE.enabled,
    },
    {
      optionId:
        APPLICATION_OPTION_IDS
          .MANTENER_MODULO,
      path:
        SEGURIDAD_ROUTES
          .MANTENER_MODULOS,
      enabled:
        SEGURIDAD_FEATURE.enabled,
    },
    {
      optionId:
        APPLICATION_OPTION_IDS
          .MANTENER_GRUPO,
      path:
        SEGURIDAD_ROUTES
          .MANTENER_GRUPO,
      enabled:
        SEGURIDAD_FEATURE.enabled,
    },
    {
      optionId:
        APPLICATION_OPTION_IDS
          .MANTENER_ACCESOS_POR_PERFIL,
      path:
        SEGURIDAD_ROUTES
          .MANTENER_ACCESOS_PERFIL,
      enabled:
        SEGURIDAD_FEATURE.enabled,
    },
    {
      optionId:
        APPLICATION_OPTION_IDS
          .MANTENER_ACCESOS_POR_USUARIO,
      path:
        SEGURIDAD_ROUTES
          .MANTENER_ACCESOS_USUARIO,
      enabled:
        SEGURIDAD_FEATURE.enabled,
    },
  ];

export const getApplicationOptionCatalog = ():
  readonly ApplicationOptionDefinition[] =>
  APPLICATION_OPTION_REGISTRY;

export const getApplicationOptionDefinition = (
  optionId: number
): ApplicationOptionDefinition | null => {
  if (
    !Number.isSafeInteger(optionId) ||
    optionId <= 0
  ) {
    return null;
  }

  return (
    APPLICATION_OPTION_REGISTRY.find(
      (definition) =>
        definition.optionId === optionId
    ) ?? null
  );
};

export const getOptionRoute = (
  optionId: number
): string | null => {
  const definition =
    getApplicationOptionDefinition(
      optionId
    );

  if (
    !definition ||
    !definition.enabled
  ) {
    return null;
  }

  return definition.path;
};

export const hasRegisteredOptionRoute = (
  optionId: number
): boolean =>
  getOptionRoute(optionId) !== null;
