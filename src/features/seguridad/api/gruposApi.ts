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
  GrupoFormData,
} from '../domain/grupos/grupoForm.types';

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

import {
  resolveSeguridadApiError,
} from './seguridadApiError';

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

    assertApiBusinessSuccess(
      result,
      GRUPO_ERROR_MESSAGES.list
    );

    return mapGruposResponse(
      result.response
    );
  } catch (error) {
    throw resolveSeguridadApiError(
        error,
        GRUPO_ERROR_MESSAGES.list
    );
  }
};

export const createGrupo = async (
  form: GrupoFormData
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

    assertApiBusinessSuccess(
      result,
      GRUPO_ERROR_MESSAGES.create
    );

    return result.response;
  } catch (error) {
    throw resolveSeguridadApiError(
        error,
        GRUPO_ERROR_MESSAGES.create
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

    assertApiBusinessSuccess(
      result,
      GRUPO_ERROR_MESSAGES.detail
    );

    if (!result.response) {
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
    throw resolveSeguridadApiError(
        error,
        GRUPO_ERROR_MESSAGES.detail
    );
  }
};

export const updateGrupo = async (
  selectedGrupoId: number,
  grupo: GrupoDetalleApi,
  form: GrupoFormData
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

    assertApiBusinessSuccess(
      result,
      GRUPO_ERROR_MESSAGES.update
    );

    return result.response;
  } catch (error) {
    throw resolveSeguridadApiError(
        error,
        GRUPO_ERROR_MESSAGES.update
    );
  }
};
