import {
  apiClient,
} from '@shared/api/apiClient';

import {
  assertApiBusinessSuccess,
} from '@shared/api/apiResponse.utils';

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
  PerfilFormData,
} from '../domain/perfiles/perfilForm.types';

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

import {
  resolveSeguridadApiError,
} from './seguridadApiError';

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

    assertApiBusinessSuccess(
      result,
      PERFIL_ERROR_MESSAGES.list
    );

    return mapPerfilesResponse(
      result.response
    );
  } catch (error) {
    throw resolveSeguridadApiError(
        error,
        PERFIL_ERROR_MESSAGES.list
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

    assertApiBusinessSuccess(
      result,
      PERFIL_ERROR_MESSAGES.detail
    );

    if (!result.response) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          PERFIL_ERROR_MESSAGES.detail
      );
    }

    return result.response;
  } catch (error) {
    throw resolveSeguridadApiError(
        error,
        PERFIL_ERROR_MESSAGES.detail
    );
  }
};

export const createPerfil = async (
  form:
    PerfilFormData
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

    assertApiBusinessSuccess(
      result,
      PERFIL_ERROR_MESSAGES.create
    );

    return result.response;
  } catch (error) {
    throw resolveSeguridadApiError(
        error,
        PERFIL_ERROR_MESSAGES.create
    );
  }
};

export const updatePerfil = async (
  perfil:
    PerfilApi,

  form:
    PerfilFormData
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

    assertApiBusinessSuccess(
      result,
      PERFIL_ERROR_MESSAGES.update
    );

    return result.response;
  } catch (error) {
    throw resolveSeguridadApiError(
        error,
        PERFIL_ERROR_MESSAGES.update
    );
  }
};