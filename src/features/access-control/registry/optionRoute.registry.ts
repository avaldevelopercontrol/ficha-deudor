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

import type {
  SisgesIconName,
} from '@shared/icons/sisges';

export interface ApplicationOptionDefinition {
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly path: string;
  readonly icon: SisgesIconName;
  readonly sectionName: string;
  readonly parentCode?: string;
  readonly enabled: boolean;
  readonly registrable: boolean;
}

const APPLICATION_OPTION_REGISTRY:
  readonly ApplicationOptionDefinition[] = [
    {
      code: 'mGestionDeudor',
      name: 'Gestión Deudor',
      description:
        'Busca deudores por RUC, DNI o teléfono y accede a su ficha.',
      path: AUTH_ROUTES.GESTION_DEUDOR,
      icon: 'user',
      sectionName:
        'Gestión de Cobranzas',
      parentCode:
        'mGestionDeCobranzas',
      enabled: true,
      registrable: true,
    },
    {
      code: 'mCambiarClave',
      name: 'Cambiar Clave',
      description:
        'Actualiza la contraseña de acceso de un usuario.',
      path:
        GESTION_USUARIOS_ROUTES
          .CAMBIAR_CLAVE,
      icon: 'key',
      sectionName:
        'Gestión de Usuarios',
      enabled:
        GESTION_USUARIOS_FEATURE
          .enabled,
      registrable: true,
    },
    {
      code: 'mAsignarUsuario',
      name: 'Asignar Usuario',
      description:
        'Asigna usuarios según cliente, perfil o responsabilidad.',
      path:
        GESTION_USUARIOS_ROUTES
          .ASIGNAR_USUARIO,
      icon: 'users',
      sectionName:
        'Gestión de Usuarios',
      enabled:
        GESTION_USUARIOS_FEATURE
          .enabled,
      registrable: true,
    },
    {
      code: 'mMantenerUsuario',
      name: 'Mantener Usuario',
      description:
        'Consulta y administra los usuarios registrados.',
      path:
        GESTION_USUARIOS_ROUTES
          .MANTENER_USUARIO,
      icon: 'user',
      sectionName:
        'Gestión de Usuarios',
      enabled:
        GESTION_USUARIOS_FEATURE
          .enabled,
      registrable: true,
    },
    {
      code: 'mMantenerPerfil',
      name: 'Mantener Perfil',
      description:
        'Consulta y administra los perfiles registrados.',
      path:
        SEGURIDAD_ROUTES
          .MANTENER_PERFIL,
      icon: 'user',
      sectionName: 'Seguridad',
      parentCode: 'mSeguridad',
      enabled:
        SEGURIDAD_FEATURE.enabled,
      registrable: true,
    },
    {
      code: 'mMantenerModulo',
      name: 'Mantener Módulo',
      description:
        'Consulta los módulos y opciones registrados en el sistema.',
      path:
        SEGURIDAD_ROUTES
          .MANTENER_MODULOS,
      icon: 'monitor',
      sectionName: 'Seguridad',
      parentCode: 'mSeguridad',
      enabled:
        SEGURIDAD_FEATURE.enabled,
      registrable: true,
    },
    {
      code: 'mMantenerGrupo',
      name: 'Mantener Grupo',
      description:
        'Consulta los grupos registrados y su cliente asociado.',
      path:
        SEGURIDAD_ROUTES
          .MANTENER_GRUPO,
      icon: 'groups',
      sectionName: 'Seguridad',
      parentCode: 'mSeguridad',
      enabled:
        SEGURIDAD_FEATURE.enabled,
      registrable: true,
    },
    {
      code:
        'mMantenerAccesosPorPerfil',
      name:
        'Mantener Accesos por Perfil',
      description:
        'Consulta y administra los permisos asignados a cada perfil.',
      path:
        SEGURIDAD_ROUTES
          .MANTENER_ACCESOS_PERFIL,
      icon: 'key',
      sectionName: 'Seguridad',
      parentCode: 'mSeguridad',
      enabled:
        SEGURIDAD_FEATURE.enabled,
      registrable: true,
    },
  ];

const normalizeOptionCode = (
  optionCode: string
): string =>
  optionCode.trim().toLocaleLowerCase(
    'es-PE'
  );

export const getApplicationOptionCatalog = ():
  readonly ApplicationOptionDefinition[] =>
  APPLICATION_OPTION_REGISTRY;

export const getApplicationOptionDefinition = (
  optionCode: string
): ApplicationOptionDefinition | null => {
  const normalizedCode =
    normalizeOptionCode(optionCode);

  if (!normalizedCode) {
    return null;
  }

  return (
    APPLICATION_OPTION_REGISTRY.find(
      (definition) =>
        normalizeOptionCode(
          definition.code
        ) === normalizedCode
    ) ?? null
  );
};

export const getRegistrableApplicationOptions = ():
  readonly ApplicationOptionDefinition[] =>
  APPLICATION_OPTION_REGISTRY.filter(
    (definition) =>
      definition.enabled &&
      definition.registrable
  );

export const getOptionRoute = (
  optionCode: string
): string | null => {
  const definition =
    getApplicationOptionDefinition(
      optionCode
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
  optionCode: string
): boolean =>
  getOptionRoute(optionCode) !== null;
