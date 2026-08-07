import {
  ApiError,
  apiClient,
} from '@shared/api/apiClient';

import {
  SEGURIDAD_API_ENDPOINTS,
} from '../constants/seguridadRoutes.constants';

import {
  buildCreateGrupoRequest,
} from '../mappers/crearGrupo.mapper';

import {
  assertGrupoDetalleMatchesSelectedId,
  buildUpdateGrupoRequest,
} from '../mappers/actualizarGrupo.mapper';

import {
  mapGruposResponse,
} from '../mappers/grupo.mapper';

import type {
  RegistrarGrupoFormData,
} from '../modules/mantener-grupo/types/registrarGrupo.types';

import type {
  CreateGrupoApiResponse,
  CreateGrupoResponseApi,
} from '../types/crearGrupo.types';

import type {
  UpdateGrupoApiResponse,
  UpdateGrupoResponseApi,
} from '../types/actualizarGrupo.types';

import type {
  GetGrupoByIdResponse,
  GetGruposListadoResponse,
  Grupo,
  GrupoDetalleApi,
} from '../types/grupo.types';

const GRUPO_ERROR_MESSAGES = {
  list:
    'No se pudo obtener la lista de grupos.',

  create:
    'No se pudo registrar el grupo.',

  detail:
    'No se pudo obtener la información del grupo.',

  update:
    'No se pudo actualizar el grupo.',
} as const;

const isRecord = (
  value: unknown
): value is Record<
  string,
  unknown
> =>
  typeof value === 'object' &&
  value !== null;

const getStringProperty = (
  value: Record<string, unknown>,
  property: string
): string | null => {
  const propertyValue =
    value[property];

  if (
    typeof propertyValue !==
      'string' ||
    !propertyValue.trim()
  ) {
    return null;
  }

  return propertyValue.trim();
};

const resolveGrupoApiError = (
  error: unknown,
  fallbackMessage: string
): string => {
  if (
    error instanceof ApiError &&
    isRecord(error.data)
  ) {
    const apiMessage =
      getStringProperty(
        error.data,
        'messageUser'
      ) ??
      getStringProperty(
        error.data,
        'message'
      );

    return (
      apiMessage ||
      error.message.trim() ||
      fallbackMessage
    );
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return fallbackMessage;
};

const isSuccessfulResponse = (
  result: {
    code: string;
    statusCode: number;
  }
): boolean =>
  (
    result.statusCode >= 200 &&
    result.statusCode < 300
  ) ||
  result.code === '00' ||
  result.code === '200';

const buildGrupoByIdEndpoint = (
  grupoId: number
): string => {
  if (
    !Number.isInteger(grupoId) ||
    grupoId <= 0
  ) {
    throw new Error(
      'El identificador del grupo no es válido.'
    );
  }

  return `${
    SEGURIDAD_API_ENDPOINTS
      .grupos
  }/${grupoId}`;
};

export const fetchGruposListado = async (
  signal?: AbortSignal
): Promise<Grupo[]> => {
  try {
    const result =
      await apiClient<
        GetGruposListadoResponse
      >(
        SEGURIDAD_API_ENDPOINTS
          .listadoGrupos,
        {
          method: 'GET',
          signal,
        }
      );

    if (
      !isSuccessfulResponse(
        result
      )
    ) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          GRUPO_ERROR_MESSAGES.list
      );
    }

    return mapGruposResponse(
      result.response
    );
  } catch (error) {
    throw new Error(
      resolveGrupoApiError(
        error,
        GRUPO_ERROR_MESSAGES.list
      )
    );
  }
};

export const createGrupo = async (
  form: RegistrarGrupoFormData
): Promise<CreateGrupoResponseApi> => {
  const body =
    buildCreateGrupoRequest(
      form
    );

  try {
    const result =
      await apiClient<
        CreateGrupoApiResponse
      >(
        SEGURIDAD_API_ENDPOINTS
          .grupos,
        {
          method: 'POST',
          body,
        }
      );

    if (
      !isSuccessfulResponse(
        result
      )
    ) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          GRUPO_ERROR_MESSAGES.create
      );
    }

    return result.response;
  } catch (error) {
    throw new Error(
      resolveGrupoApiError(
        error,
        GRUPO_ERROR_MESSAGES.create
      )
    );
  }
};

export const fetchGrupoById = async (
  grupoId: number,
  signal?: AbortSignal
): Promise<GrupoDetalleApi> => {
  try {
    const result =
      await apiClient<
        GetGrupoByIdResponse
      >(
        buildGrupoByIdEndpoint(
          grupoId
        ),
        {
          method: 'GET',
          signal,
        }
      );

    if (
      !isSuccessfulResponse(
        result
      ) ||
      !result.response
    ) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          GRUPO_ERROR_MESSAGES.detail
      );
    }

    assertGrupoDetalleMatchesSelectedId(
      grupoId,
      result.response
    );

    return result.response;
  } catch (error) {
    throw new Error(
      resolveGrupoApiError(
        error,
        GRUPO_ERROR_MESSAGES.detail
      )
    );
  }
};

export const updateGrupo = async (
  selectedGrupoId: number,
  grupo: GrupoDetalleApi,
  form: RegistrarGrupoFormData
): Promise<UpdateGrupoResponseApi> => {
  const body =
    buildUpdateGrupoRequest(
      selectedGrupoId,
      grupo,
      form
    );

  try {
    const result =
      await apiClient<
        UpdateGrupoApiResponse
      >(
        SEGURIDAD_API_ENDPOINTS
          .grupos,
        {
          method: 'PUT',
          body,
        }
      );

    if (
      !isSuccessfulResponse(
        result
      )
    ) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          GRUPO_ERROR_MESSAGES.update
      );
    }

    return result.response;
  } catch (error) {
    throw new Error(
      resolveGrupoApiError(
        error,
        GRUPO_ERROR_MESSAGES.update
      )
    );
  }
};
