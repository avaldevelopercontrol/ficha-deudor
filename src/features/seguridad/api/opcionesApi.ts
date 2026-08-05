import {
  ApiError,
  apiClient,
} from '@shared/api/apiClient';

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
} from '../modules/mantener-modulos/types/editarModulo.types';

import type {
  RegistrarModuloFormData,
} from '../modules/mantener-modulos/types/registrarModulo.types';

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

const resolveOpcionesApiError = (
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

    if (
      !isSuccessfulResponse(
        result
      )
    ) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          OPCIONES_ERROR_MESSAGES.list
      );
    }

    return mapOpcionesResponse(
      result.response
    );
  } catch (error) {
    throw new Error(
      resolveOpcionesApiError(
        error,
        OPCIONES_ERROR_MESSAGES.list
      )
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

    if (
      !isSuccessfulResponse(
        result
      ) ||
      !result.response
    ) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          OPCIONES_ERROR_MESSAGES.detail
      );
    }

    return result.response;
  } catch (error) {
    throw new Error(
      resolveOpcionesApiError(
        error,
        OPCIONES_ERROR_MESSAGES.detail
      )
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

    if (
      !isSuccessfulResponse(
        result
      )
    ) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          OPCIONES_ERROR_MESSAGES.create
      );
    }

    return result.response;
  } catch (error) {
    throw new Error(
      resolveOpcionesApiError(
        error,
        OPCIONES_ERROR_MESSAGES.create
      )
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

      if (
        !isSuccessfulResponse(
          result
        )
      ) {
        throw new Error(
          result.messageUser?.trim() ||
            result.message?.trim() ||
            OPCIONES_ERROR_MESSAGES.update
        );
      }

      if (
        body.nId_Opcion ===
        moduloDetalle.nId_Opcion
      ) {
        currentModuleResponse =
          result.response;
      }
    } catch (error) {
      throw new Error(
        resolveOpcionesApiError(
          error,
          OPCIONES_ERROR_MESSAGES.update
        )
      );
    }
  }

  return currentModuleResponse;
};
