import {
  ApiError,
  apiClient,
} from '@shared/api/apiClient';

import {
  assertApiSuccess,
  getApiErrorMessage,
  normalizeApiCollectionResponse,
  unwrapApiObjectResponse,
} from '@shared/api/apiResponse.utils';

import {
  SEGURIDAD_API_ENDPOINTS,
} from '../constants/seguridadRoutes.constants';

import {
  buildPerfilOpcionUpdatePlan,
} from '../mappers/actualizarPerfilOpcion.mapper';

import {
  buildCreatePerfilOpcionRequests,
} from '../mappers/crearPerfilOpcion.mapper';

import {
  mapPerfilOpcionesPorPerfilResponse,
  mapPerfilOptionsCountResponse,
  mapPerfilesAccesoResponse,
} from '../mappers/perfilOpcion.mapper';

import type {
  PerfilAccesoOption,
  RegistrarPerfilOpcionesData,
} from '../modules/mantener-accesos-perfil/types/asignarAccesosPerfil.types';

import type {
  CreatePerfilOpcionApiResponse,
  CreatePerfilOpcionRequest,
  CreatePerfilOpcionResponseApi,
  GetPerfilOpcionesPorPerfilResponse,
  GetPerfilOptionsCountResponse,
  GetPerfilesAccesoResponse,
  PerfilAccesoOptionApi,
  PerfilOpcionApi,
  PerfilOpcionCount,
  PerfilOpcionCountApi,
  PerfilOpcionDetalle,
  UpdatePerfilOpcionApiResponse,
  UpdatePerfilOpcionRequest,
  UpdatePerfilOpcionResponseApi,
} from '../types/perfilOpcion.types';

const PERFIL_OPTIONS_COUNT_ERROR =
  'No se pudo obtener la lista de accesos por perfil.';

const PERFILES_ACCESO_ERROR =
  'No se pudo obtener la lista de perfiles.';

const PERFIL_OPCIONES_DETAIL_ERROR =
  'No se pudieron obtener los accesos del perfil.';

const CREATE_PERFIL_OPCION_ERROR =
  'No se pudieron registrar los accesos del perfil.';

const UPDATE_PERFIL_OPCION_ERROR =
  'No se pudieron actualizar los accesos del perfil.';

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const resolvePerfilOpcionError = (
  error: unknown,
  fallbackMessage: string
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
        fallbackMessage
      )
    );
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error;
  }

  return new Error(fallbackMessage);
};

const assertCreatedAssignment = (
  response: CreatePerfilOpcionResponseApi,
  request: CreatePerfilOpcionRequest
): void => {
  if (
    !Number.isSafeInteger(
      response.nId_Perfil
    ) ||
    response.nId_Perfil !==
      request.nId_Perfil ||
    !Number.isSafeInteger(
      response.nId_Opcion
    ) ||
    response.nId_Opcion !==
      request.nId_Opcion
  ) {
    throw new Error(
      'El servidor no confirmó correctamente el acceso registrado.'
    );
  }
};

const assertUpdatedAssignment = (
  response: UpdatePerfilOpcionResponseApi,
  request: UpdatePerfilOpcionRequest
): void => {
  if (
    !Number.isSafeInteger(
      response.nId_PerfilOpcion
    ) ||
    response.nId_PerfilOpcion !==
      request.nId_PerfilOpcion ||
    !Number.isSafeInteger(
      response.nId_Perfil
    ) ||
    response.nId_Perfil !==
      request.nId_Perfil ||
    !Number.isSafeInteger(
      response.nId_Opcion
    ) ||
    response.nId_Opcion !==
      request.nId_Opcion
  ) {
    throw new Error(
      'El servidor no confirmó correctamente el acceso actualizado.'
    );
  }
};

export const fetchPerfilOptionsCount = async (
  signal?: AbortSignal
): Promise<PerfilOpcionCount[]> => {
  try {
    const result =
      await apiClient<GetPerfilOptionsCountResponse>(
        SEGURIDAD_API_ENDPOINTS
          .perfilOpcionesCount,
        {
          method: 'GET',
          signal,
        }
      );

    assertApiSuccess(
      result,
      PERFIL_OPTIONS_COUNT_ERROR
    );

    const response =
      normalizeApiCollectionResponse<PerfilOpcionCountApi>(
        result.response,
        PERFIL_OPTIONS_COUNT_ERROR
      );

    return mapPerfilOptionsCountResponse(
      response
    );
  } catch (error) {
    throw resolvePerfilOpcionError(
      error,
      PERFIL_OPTIONS_COUNT_ERROR
    );
  }
};

export const fetchPerfilesAcceso = async (
  signal?: AbortSignal
): Promise<PerfilAccesoOption[]> => {
  try {
    const result =
      await apiClient<GetPerfilesAccesoResponse>(
        SEGURIDAD_API_ENDPOINTS
          .listadoPerfiles,
        {
          method: 'GET',
          signal,
        }
      );

    assertApiSuccess(
      result,
      PERFILES_ACCESO_ERROR
    );

    const response =
      normalizeApiCollectionResponse<PerfilAccesoOptionApi>(
        result.response,
        PERFILES_ACCESO_ERROR
      );

    return mapPerfilesAccesoResponse(
      response
    );
  } catch (error) {
    throw resolvePerfilOpcionError(
      error,
      PERFILES_ACCESO_ERROR
    );
  }
};

export const fetchPerfilOpcionesByPerfil = async (
  perfilId: number,
  signal?: AbortSignal
): Promise<PerfilOpcionDetalle[]> => {
  try {
    if (
      !Number.isSafeInteger(perfilId) ||
      perfilId <= 0
    ) {
      throw new Error(
        'El identificador del perfil no es válido.'
      );
    }

    const result =
      await apiClient<GetPerfilOpcionesPorPerfilResponse>(
        SEGURIDAD_API_ENDPOINTS
          .perfilOpcionesPorPerfil,
        {
          method: 'GET',
          headers: {
            nId_Perfil: String(perfilId),
          },
          signal,
        }
      );

    assertApiSuccess(
      result,
      PERFIL_OPCIONES_DETAIL_ERROR
    );

    const response =
      normalizeApiCollectionResponse<PerfilOpcionApi>(
        result.response,
        PERFIL_OPCIONES_DETAIL_ERROR
      );

    return mapPerfilOpcionesPorPerfilResponse(
      response
    );
  } catch (error) {
    throw resolvePerfilOpcionError(
      error,
      PERFIL_OPCIONES_DETAIL_ERROR
    );
  }
};

const createPerfilOpcion = async (
  request: CreatePerfilOpcionRequest,
  signal?: AbortSignal
): Promise<void> => {
  const result =
    await apiClient<CreatePerfilOpcionApiResponse>(
      SEGURIDAD_API_ENDPOINTS
        .perfilOpciones,
      {
        method: 'POST',
        body: request,
        signal,
      }
    );

  const response =
    unwrapApiObjectResponse<CreatePerfilOpcionResponseApi>(
      result,
      CREATE_PERFIL_OPCION_ERROR
    );

  assertCreatedAssignment(
    response,
    request
  );
};

const updatePerfilOpcion = async (
  request: UpdatePerfilOpcionRequest,
  signal?: AbortSignal
): Promise<void> => {
  const result =
    await apiClient<UpdatePerfilOpcionApiResponse>(
      SEGURIDAD_API_ENDPOINTS
        .perfilOpciones,
      {
        method: 'PUT',
        body: request,
        signal,
      }
    );

  const response =
    unwrapApiObjectResponse<UpdatePerfilOpcionResponseApi>(
      result,
      UPDATE_PERFIL_OPCION_ERROR
    );

  assertUpdatedAssignment(
    response,
    request
  );
};

export const createPerfilOpciones = async (
  data: RegistrarPerfilOpcionesData,
  authenticatedUserId: string,
  signal?: AbortSignal
): Promise<void> => {
  const requests =
    buildCreatePerfilOpcionRequests(
      data,
      authenticatedUserId
    );

  let completed = 0;

  for (const request of requests) {
    try {
      await createPerfilOpcion(
        request,
        signal
      );

      completed += 1;
    } catch (error) {
      const resolvedError =
        resolvePerfilOpcionError(
          error,
          CREATE_PERFIL_OPCION_ERROR
        );

      if (
        resolvedError.name ===
        'AbortError'
      ) {
        throw resolvedError;
      }

      if (completed > 0) {
        throw new Error(
          `Se registraron ${completed} de ${requests.length} opciones. No se pudo registrar la opción ${request.nId_Opcion}: ${resolvedError.message} Cierre el modal y revise el perfil antes de volver a intentar.`
        );
      }

      throw resolvedError;
    }
  }
};

export const updatePerfilOpciones = async (
  existingAssignments: readonly PerfilOpcionDetalle[],
  data: RegistrarPerfilOpcionesData,
  authenticatedUserId: string,
  signal?: AbortSignal
): Promise<void> => {
  const {
    updateRequests,
    newAssignments,
  } = buildPerfilOpcionUpdatePlan(
    existingAssignments,
    data,
    authenticatedUserId
  );

  const createRequests =
    newAssignments.length > 0
      ? buildCreatePerfilOpcionRequests(
          {
            perfilId: data.perfilId,
            assignments: newAssignments,
          },
          authenticatedUserId
        )
      : [];

  const operations = [
    ...updateRequests.map(
      (request) => ({
        type: 'actualizar' as const,
        optionId: request.nId_Opcion,
        execute: () =>
          updatePerfilOpcion(
            request,
            signal
          ),
      })
    ),
    ...createRequests.map(
      (request) => ({
        type: 'registrar' as const,
        optionId: request.nId_Opcion,
        execute: () =>
          createPerfilOpcion(
            request,
            signal
          ),
      })
    ),
  ];

  let completed = 0;

  for (const operation of operations) {
    try {
      await operation.execute();
      completed += 1;
    } catch (error) {
      const resolvedError =
        resolvePerfilOpcionError(
          error,
          UPDATE_PERFIL_OPCION_ERROR
        );

      if (
        resolvedError.name ===
        'AbortError'
      ) {
        throw resolvedError;
      }

      if (completed > 0) {
        throw new Error(
          `Se procesaron ${completed} de ${operations.length} cambios. No se pudo ${operation.type} la opción ${operation.optionId}: ${resolvedError.message} Cierre el modal y revise el perfil antes de volver a intentar.`
        );
      }

      throw resolvedError;
    }
  }
};
