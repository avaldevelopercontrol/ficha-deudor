import {
  ApiError,
  apiClient,
} from '@shared/api/apiClient';

import {
  assertApiSuccess,
  getApiErrorMessage,
  normalizeApiCollectionResponse,
} from '@shared/api/apiResponse.utils';

import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';


import {
  SEGURIDAD_API_ENDPOINTS,
} from '@features/seguridad/constants/seguridadRoutes.constants';

import {
  fetchUsuarioGrupoOpcionesPermisosByUsuarioGrupo,
} from '@features/seguridad/api/usuarioGrupoOpcionesApi';

import type {
  AccessOptionSource,
  ProfileOptionAccessSource,
  UserGroupOptionAccessSource,
} from '../types/accessControl.types';

interface AccessOptionApi {
  nId_Opcion: unknown;
  sCodigoOpcion: unknown;
  sNombreOpcion: unknown;
  sDescripcionOpcion?: unknown;
  sUrlBI?: unknown;
  sImagenOpcion?: unknown;
  sEmailOpcion?: unknown;
  sIcono?: unknown;
  nTipo: unknown;
  nId_OpcionPadre?: unknown;
  nOrden: unknown;
  bVisible: unknown;
  bEstado: unknown;
}

interface ProfileOptionAccessApi {
  nId_PerfilOpcion: unknown;
  nId_Perfil: unknown;
  nId_Opcion: unknown;
  bConsultar: unknown;
  bInsertar: unknown;
  bEditar: unknown;
  bEliminar: unknown;
  bExportar: unknown;
  bEstado: unknown;
}

interface AccessControlApiData {
  options: AccessOptionSource[];
  assignments: ProfileOptionAccessSource[];
  userGroupAssignments: UserGroupOptionAccessSource[];
}

const ACCESS_OPTIONS_ERROR =
  'No se pudo obtener la estructura de módulos del sistema.';

const PROFILE_ACCESS_ERROR =
  'No se pudieron obtener los accesos del perfil.';

const ACCESS_CONTROL_ERROR =
  'No se pudieron cargar los accesos del usuario.';

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const toPositiveInteger = (
  value: unknown,
  fieldName: string
): number => {
  const parsed = Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed <= 0
  ) {
    throw new Error(
      `El campo ${fieldName} no contiene un identificador válido.`
    );
  }

  return parsed;
};

const toNonNegativeInteger = (
  value: unknown,
  fieldName: string
): number => {
  const parsed = Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 0
  ) {
    throw new Error(
      `El campo ${fieldName} no contiene un entero válido.`
    );
  }

  return parsed;
};

const toOptionalParentId = (
  value: unknown
): number => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 0;
  }

  return toNonNegativeInteger(
    value,
    'nId_OpcionPadre'
  );
};

const toRequiredText = (
  value: unknown,
  fieldName: string
): string => {
  if (typeof value !== 'string') {
    throw new Error(
      `El campo ${fieldName} no contiene un texto válido.`
    );
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new Error(
      `El campo ${fieldName} no contiene un texto válido.`
    );
  }

  return normalized;
};

const toOptionalText = (
  value: unknown
): string =>
  typeof value === 'string'
    ? value.trim()
    : '';


const toNullableText = (
  value: unknown
): string | null => {
  const normalized =
    toOptionalText(value);

  return normalized || null;
};

const toBoolean = (
  value: unknown
): boolean =>
  value === true ||
  value === 1 ||
  value === '1' ||
  value === 'true';

const mapAccessOption = (
  option: AccessOptionApi
): AccessOptionSource => ({
  id: toPositiveInteger(
    option.nId_Opcion,
    'nId_Opcion'
  ),
  code: toRequiredText(
    option.sCodigoOpcion,
    'sCodigoOpcion'
  ),
  name: toRequiredText(
    option.sNombreOpcion,
    'sNombreOpcion'
  ),
  description: toOptionalText(
    option.sDescripcionOpcion
  ),
  urlBI: toNullableText(
    option.sUrlBI
  ),
  image: toNullableText(
    option.sImagenOpcion
  ),
  email: toNullableText(
    option.sEmailOpcion
  ),
  icon: toOptionalText(
    option.sIcono
  ),
  type: toPositiveInteger(
    option.nTipo,
    'nTipo'
  ),
  parentId: toOptionalParentId(
    option.nId_OpcionPadre
  ),
  order: toNonNegativeInteger(
    option.nOrden,
    'nOrden'
  ),
  visible: toBoolean(
    option.bVisible
  ),
  active: toBoolean(
    option.bEstado
  ),
});

const mapProfileOptionAccess = (
  assignment: ProfileOptionAccessApi
): ProfileOptionAccessSource => ({
  assignmentId: toPositiveInteger(
    assignment.nId_PerfilOpcion,
    'nId_PerfilOpcion'
  ),
  profileId: toPositiveInteger(
    assignment.nId_Perfil,
    'nId_Perfil'
  ),
  optionId: toPositiveInteger(
    assignment.nId_Opcion,
    'nId_Opcion'
  ),
  permissions: {
    consultar: toBoolean(
      assignment.bConsultar
    ),
    insertar: toBoolean(
      assignment.bInsertar
    ),
    editar: toBoolean(
      assignment.bEditar
    ),
    eliminar: toBoolean(
      assignment.bEliminar
    ),
    exportar: toBoolean(
      assignment.bExportar
    ),
  },
  active: toBoolean(
    assignment.bEstado
  ),
});

const resolveAccessControlError = (
  error: unknown
): Error => {
  if (
    error instanceof Error &&
    error.name === 'AbortError'
  ) {
    return error;
  }

  if (
    error instanceof ApiError &&
    isRecord(error.data)
  ) {
    return new Error(
      getApiErrorMessage(
        error.data,
        ACCESS_CONTROL_ERROR
      )
    );
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error;
  }

  return new Error(
    ACCESS_CONTROL_ERROR
  );
};

const fetchAccessOptions = async (
  signal?: AbortSignal
): Promise<AccessOptionSource[]> => {
  const result = await apiClient<
    ApiResponseSimple<
      | AccessOptionApi[]
      | AccessOptionApi
      | null
    >
  >(
    SEGURIDAD_API_ENDPOINTS
      .listadoOpciones,
    {
      method: 'GET',
      signal,
    }
  );

  assertApiSuccess(
    result,
    ACCESS_OPTIONS_ERROR
  );

  return normalizeApiCollectionResponse<AccessOptionApi>(
    result.response,
    ACCESS_OPTIONS_ERROR
  ).map(mapAccessOption);
};

const fetchProfileOptionAccess = async (
  profileId: number,
  signal?: AbortSignal
): Promise<ProfileOptionAccessSource[]> => {
  const result = await apiClient<
    ApiResponseSimple<
      | ProfileOptionAccessApi[]
      | ProfileOptionAccessApi
      | null
    >
  >(
    SEGURIDAD_API_ENDPOINTS
      .perfilOpcionesPorPerfil,
    {
      method: 'GET',
      headers: {
        nId_Perfil: String(profileId),
      },
      signal,
    }
  );

  assertApiSuccess(
    result,
    PROFILE_ACCESS_ERROR
  );

  return normalizeApiCollectionResponse<ProfileOptionAccessApi>(
    result.response,
    PROFILE_ACCESS_ERROR
  ).map(mapProfileOptionAccess);
};

export const fetchAccessControlData = async (
  profileId: number,
  userId: number,
  groupId: number | null,
  signal?: AbortSignal
): Promise<AccessControlApiData> => {
  if (
    !Number.isSafeInteger(profileId) ||
    profileId <= 0
  ) {
    throw new Error(
      'El usuario autenticado no tiene un perfil válido.'
    );
  }

  if (
    !Number.isSafeInteger(userId) ||
    userId <= 0
  ) {
    throw new Error(
      'El usuario autenticado no tiene un identificador válido.'
    );
  }

  if (
    groupId !== null &&
    (
      !Number.isSafeInteger(groupId) ||
      groupId <= 0
    )
  ) {
    throw new Error(
      'El grupo seleccionado no tiene un identificador válido.'
    );
  }

  try {
    const [
      options,
      assignments,
      userGroupDetails,
    ] = await Promise.all([
      fetchAccessOptions(signal),
      fetchProfileOptionAccess(
        profileId,
        signal
      ),
      groupId === null
        ? Promise.resolve([])
        : fetchUsuarioGrupoOpcionesPermisosByUsuarioGrupo(
            userId,
            groupId,
            signal
          ),
    ]);

    const userGroupAssignments:
      UserGroupOptionAccessSource[] =
      userGroupDetails.map(
        (assignment) => ({
          assignmentId:
            assignment.idUsuarioGrupoOpcion,
          userId:
            assignment.idUsuario,
          groupId:
            assignment.idGrupo,
          optionId:
            assignment.idOpcion,
          permissions: {
            consultar:
              assignment.consultar,
            insertar:
              assignment.insertar,
            editar:
              assignment.editar,
            eliminar:
              assignment.eliminar,
            exportar:
              assignment.exportar,
          },
          active:
            assignment.estadoActivo,
        })
      );

    return {
      options,
      assignments,
      userGroupAssignments,
    };
  } catch (error) {
    throw resolveAccessControlError(
      error
    );
  }
};
