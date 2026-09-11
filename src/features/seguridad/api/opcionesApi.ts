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
  buildUpdateOpcionRequests,
} from '../mappers/actualizarOpcion.mapper';

import {
  buildCreateOpcionRequest,
} from '../mappers/crearOpcion.mapper';

import {
  mapOpcionesResponse,
} from '../mappers/opcion.mapper';

import type {
  EditarModuloFormData,
} from '../domain/modulos/moduloForm.types';

import type {
  RegistrarModuloFormData,
} from '../domain/modulos/moduloForm.types';

import type {
  UpdateOpcionApiResponse,
  UpdateOpcionResponseApi,
} from '../types/actualizarOpcion.types';

import type {
  CreateOpcionApiResponse,
  CreateOpcionResponseApi,
} from '../types/crearOpcion.types';

import type {
  GetOpcionByIdResponse,
  GetOpcionesResponse,
  Modulo,
  OpcionApi,
} from '../types/opcion.types';

import {
  resolveSeguridadApiError,
} from './seguridadApiError';

const OPCIONES_ERROR_MESSAGES = {
  list:
    'No se pudo obtener la lista de módulos.',

  create:
    'No se pudo registrar el módulo.',

  detail:
    'No se pudo obtener la información del módulo.',

  update:
    'No se pudo actualizar el módulo.',
} as const;

const buildOpcionByIdEndpoint = (
  opcionId: number
): string => {
  if (
    !Number.isInteger(opcionId) ||
    opcionId <= 0
  ) {
    throw new Error(
      'El identificador del módulo no es válido.'
    );
  }

  return `${
    SEGURIDAD_API_ENDPOINTS
      .opciones
  }/${opcionId}`;
};

export const fetchOpciones = async (
  signal?: AbortSignal
): Promise<Modulo[]> => {
  try {
    const result =
      await apiClient<
        GetOpcionesResponse
      >(
        SEGURIDAD_API_ENDPOINTS
          .listadoOpciones,
        {
          method: 'GET',
          signal,
        }
      );

    assertApiBusinessSuccess(
      result,
      OPCIONES_ERROR_MESSAGES.list
    );

    return mapOpcionesResponse(
      result.response
    );
  } catch (error) {
    throw resolveSeguridadApiError(
        error,
        OPCIONES_ERROR_MESSAGES.list
    );
  }
};

export const fetchOpcionById = async (
  opcionId: number,
  signal?: AbortSignal
): Promise<OpcionApi> => {
  try {
    const result =
      await apiClient<
        GetOpcionByIdResponse
      >(
        buildOpcionByIdEndpoint(
          opcionId
        ),
        {
          method: 'GET',
          signal,
        }
      );

    assertApiBusinessSuccess(
      result,
      OPCIONES_ERROR_MESSAGES.detail
    );

    if (!result.response) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          OPCIONES_ERROR_MESSAGES.detail
      );
    }

    return result.response;
  } catch (error) {
    throw resolveSeguridadApiError(
        error,
        OPCIONES_ERROR_MESSAGES.detail
    );
  }
};

export const createOpcion = async (
  form:
    RegistrarModuloFormData,

  opciones:
    readonly Modulo[],

  authenticatedUserId:
    string
): Promise<
  CreateOpcionResponseApi
> => {
  const body =
    buildCreateOpcionRequest(
      form,
      opciones,
      authenticatedUserId
    );

  try {
    const result =
      await apiClient<
        CreateOpcionApiResponse
      >(
        SEGURIDAD_API_ENDPOINTS
          .opciones,
        {
          method: 'POST',
          body,
        }
      );

    assertApiBusinessSuccess(
      result,
      OPCIONES_ERROR_MESSAGES.create
    );

    return result.response;
  } catch (error) {
    throw resolveSeguridadApiError(
        error,
        OPCIONES_ERROR_MESSAGES.create
    );
  }
};

export const updateOpcion = async (
  moduloDetalle: OpcionApi,
  form: EditarModuloFormData,
  opciones: readonly Modulo[],
  authenticatedUserId: string
): Promise<UpdateOpcionResponseApi | null> => {
  const requests =
    buildUpdateOpcionRequests(
      moduloDetalle,
      form,
      opciones,
      authenticatedUserId
    );

  if (requests.length === 0) {
    return null;
  }

  let currentModuleResponse:
    UpdateOpcionResponseApi | null = null;

  for (const body of requests) {
    try {
      const result =
        await apiClient<
          UpdateOpcionApiResponse
        >(
          SEGURIDAD_API_ENDPOINTS
            .opciones,
          {
            method: 'PUT',
            body,
          }
        );

      assertApiBusinessSuccess(
        result,
        OPCIONES_ERROR_MESSAGES.update
      );

      if (
        body.nId_Opcion ===
        moduloDetalle.nId_Opcion
      ) {
        currentModuleResponse =
          result.response;
      }
    } catch (error) {
      throw resolveSeguridadApiError(
          error,
          OPCIONES_ERROR_MESSAGES.update
      );
    }
  }

  return currentModuleResponse;
};
