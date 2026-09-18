import {
  GESTION_ANALITICA_ROUTES,
  REPORTERIA_ROUTES,
} from '@features/gestion-analitica/constants';

import {
  GESTION_COBRANZAS_ROUTES,
} from '@features/gestion-cobranzas/constants/gestionCobranzasRoutes.constants';

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

export type ApplicationOptionPopupType =
  'produccion-online';

interface ApplicationOptionPopupDefinition {
  /** nId_Opcion persistente en la base de datos. */
  readonly optionId: ApplicationOptionId;

  /** Popup React asociado a una opción que no navega a una ruta normal. */
  readonly popupType: ApplicationOptionPopupType;

  readonly enabled: boolean;
}

const APPLICATION_OPTION_REGISTRY:
  readonly ApplicationOptionDefinition[] = [
    {
      optionId:
        APPLICATION_OPTION_IDS
          .ANALISIS_CARTERAS,
      path:
        GESTION_ANALITICA_ROUTES
          .ANALISIS_CARTERAS,
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
          .SESIONES_BI,
      path:
        GESTION_ANALITICA_ROUTES
          .SESIONES_BI,
      enabled: true,
    },
    {
      optionId:
        APPLICATION_OPTION_IDS
          .GESTION_DEUDOR,
      path:
        GESTION_COBRANZAS_ROUTES
          .GESTION_DEUDOR,
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

const APPLICATION_OPTION_POPUP_REGISTRY:
  readonly ApplicationOptionPopupDefinition[] = [
    {
      optionId:
        APPLICATION_OPTION_IDS
          .PRODUCCION_ONLINE,
      popupType: 'produccion-online',
      enabled: true,
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

export const getOptionPopupType = (
  optionId: number
): ApplicationOptionPopupType | null => {
  if (
    !Number.isSafeInteger(optionId) ||
    optionId <= 0
  ) {
    return null;
  }

  const definition =
    APPLICATION_OPTION_POPUP_REGISTRY.find(
      (item) =>
        item.optionId === optionId
    );

  if (
    !definition ||
    !definition.enabled
  ) {
    return null;
  }

  return definition.popupType;
};

export const hasRegisteredOptionDestination = (
  optionId: number
): boolean =>
  hasRegisteredOptionRoute(optionId) ||
  getOptionPopupType(optionId) !== null;
