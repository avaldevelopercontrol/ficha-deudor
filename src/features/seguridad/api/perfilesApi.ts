import {
  ApiError,
  apiClient,
} from '@shared/api/apiClient';

import {
  SEGURIDAD_API_ENDPOINTS,
} from '../constants/seguridadRoutes.constants';

import {
  buildUpdatePerfilRequest,
} from '../mappers/actualizarPerfil.mapper';

import {
  buildCreatePerfilRequest,
} from '../mappers/crearPerfil.mapper';

import {
  mapPerfilesResponse,
} from '../mappers/perfil.mapper';

import type {
  RegistrarPerfilFormData,
} from '../modules/mantener-perfil/types/registrarPerfil.types';

import type {
  UpdatePerfilApiResponse,
  UpdatePerfilResponseApi,
} from '../types/actualizarPerfil.types';

import type {
  CreatePerfilApiResponse,
  CreatePerfilResponseApi,
} from '../types/crearPerfil.types';

import type {
  GetPerfilByIdResponse,
  GetPerfilesResponse,
  Perfil,
  PerfilApi,
} from '../types/perfil.types';

const PERFIL_FETCH_PAGE_NUMBER =
  1;

const PERFIL_FETCH_PAGE_SIZE =
  1000;

const PERFIL_ERROR_MESSAGES = {
  list:
    'No se pudo obtener la lista de perfiles.',

  detail:
    'No se pudo obtener la información del perfil.',

  create:
    'No se pudo registrar el perfil.',

  update:
    'No se pudo actualizar el perfil.',
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
  value:
    Record<string, unknown>,

  property:
    string
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

const resolvePerfilApiError = (
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

const buildPerfilesEndpoint =
  (): string => {
    const searchParams =
      new URLSearchParams({
        PageNumber:
          String(
            PERFIL_FETCH_PAGE_NUMBER
          ),

        PageSize:
          String(
            PERFIL_FETCH_PAGE_SIZE
          ),
      });

    return `${
      SEGURIDAD_API_ENDPOINTS
        .perfiles
    }?${searchParams.toString()}`;
  };

const buildPerfilByIdEndpoint = (
  perfilId: number
): string => {
  if (
    !Number.isInteger(perfilId) ||
    perfilId <= 0
  ) {
    throw new Error(
      'El identificador del perfil no es válido.'
    );
  }

  return `${
    SEGURIDAD_API_ENDPOINTS
      .perfiles
  }/${perfilId}`;
};

export const fetchPerfiles = async (
  signal?: AbortSignal
): Promise<Perfil[]> => {
  try {
    const result =
      await apiClient<
        GetPerfilesResponse
      >(
        buildPerfilesEndpoint(),
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
          PERFIL_ERROR_MESSAGES.list
      );
    }

    return mapPerfilesResponse(
      result.response
    );
  } catch (error) {
    throw new Error(
      resolvePerfilApiError(
        error,
        PERFIL_ERROR_MESSAGES.list
      )
    );
  }
};

export const fetchPerfilById = async (
  perfilId: number,
  signal?: AbortSignal
): Promise<PerfilApi> => {
  try {
    const result =
      await apiClient<
        GetPerfilByIdResponse
      >(
        buildPerfilByIdEndpoint(
          perfilId
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
          PERFIL_ERROR_MESSAGES.detail
      );
    }

    return result.response;
  } catch (error) {
    throw new Error(
      resolvePerfilApiError(
        error,
        PERFIL_ERROR_MESSAGES.detail
      )
    );
  }
};

export const createPerfil = async (
  form:
    RegistrarPerfilFormData
): Promise<
  CreatePerfilResponseApi
> => {
  const body =
    buildCreatePerfilRequest(
      form
    );

  try {
    const result =
      await apiClient<
        CreatePerfilApiResponse
      >(
        SEGURIDAD_API_ENDPOINTS
          .perfiles,
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
          PERFIL_ERROR_MESSAGES.create
      );
    }

    return result.response;
  } catch (error) {
    throw new Error(
      resolvePerfilApiError(
        error,
        PERFIL_ERROR_MESSAGES.create
      )
    );
  }
};

export const updatePerfil = async (
  perfil:
    PerfilApi,

  form:
    RegistrarPerfilFormData
): Promise<
  UpdatePerfilResponseApi
> => {
  const body =
    buildUpdatePerfilRequest(
      perfil,
      form
    );

  try {
    const result =
      await apiClient<
        UpdatePerfilApiResponse
      >(
        SEGURIDAD_API_ENDPOINTS
          .perfiles,
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
          PERFIL_ERROR_MESSAGES.update
      );
    }

    return result.response;
  } catch (error) {
    throw new Error(
      resolvePerfilApiError(
        error,
        PERFIL_ERROR_MESSAGES.update
      )
    );
  }
};