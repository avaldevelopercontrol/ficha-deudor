import {
  ApiError,
  apiClient,
} from '@shared/api/apiClient';

import {
  assertApiBusinessSuccess,
} from '@shared/api/apiResponse.utils';

import {
  GESTION_USUARIOS_API_ENDPOINTS,
} from '../constants/gestionUsuariosRoutes.constants';

import {
  mapUsuarioZonaAsignada,
  mapUsuarioZonaFaltante,
  sortUsuarioZonas,
} from '../mappers/usuarioZonas.mapper';

import type {
  UsuarioZonaItem,
} from '../modules/asignar-usuario/types/usuarioZonas.types';

import type {
  GetZonasAsignadasApiResponse,
  GetZonasFaltantesApiResponse,
  UsuarioZonaMutationApiResponse,
  UsuarioZonaMutationRequestApi,
} from '../types/usuarioZonas.types';

const ZONAS_ERROR_MESSAGES = {
  assigned:
    'No se pudieron cargar las zonas asignadas.',
  available:
    'No se pudieron cargar las zonas disponibles.',
  create:
    'No se pudo asignar la zona al usuario.',
  update:
    'No se pudo actualizar la asignación de la zona.',
} as const;

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null;

const getStringProperty = (
  value: Record<string, unknown>,
  property: string
): string | null => {
  const candidate = value[property];

  return typeof candidate === 'string' &&
    candidate.trim()
    ? candidate.trim()
    : null;
};

const resolveApiError = (
  error: unknown,
  fallback: string
): string => {
  if (
    error instanceof ApiError &&
    isRecord(error.data)
  ) {
    return (
      getStringProperty(
        error.data,
        'messageUser'
      ) ??
      getStringProperty(
        error.data,
        'message'
      ) ??
      (error.message.trim() || fallback)
    );
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return fallback;
};

const assertPositiveId = (
  value: number,
  label: string
): void => {
  if (
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(
      `${label} no es válido.`
    );
  }
};

const assertZona = (
  zona: string
): string => {
  const normalized = zona.trim();

  if (!normalized) {
    throw new Error(
      'La zona seleccionada no es válida.'
    );
  }

  return normalized;
};

const buildZonasQuery = (
  idCliente: number,
  idUsuario: number
): string => {
  assertPositiveId(
    idCliente,
    'El identificador del cliente'
  );
  assertPositiveId(
    idUsuario,
    'El identificador del usuario'
  );

  return new URLSearchParams({
    nId_Cliente: String(idCliente),
    nId_Usuario: String(idUsuario),
  }).toString();
};

export const fetchZonasFaltantesByClienteUsuario =
  async (
    idCliente: number,
    idUsuario: number,
    signal?: AbortSignal
  ): Promise<UsuarioZonaItem[]> => {
    const query = buildZonasQuery(
      idCliente,
      idUsuario
    );

    try {
      const result =
        await apiClient<
          GetZonasFaltantesApiResponse
        >(
          `${
            GESTION_USUARIOS_API_ENDPOINTS
              .getZonasFaltantesByClienteUsuario
          }?${query}`,
          {
            signal,
            cache: 'no-store',
          }
        );

      assertApiBusinessSuccess(
        result,
        ZONAS_ERROR_MESSAGES.available
      );

      return sortUsuarioZonas(
        (result.response ?? []).map(
          (item) =>
            mapUsuarioZonaFaltante(
              item,
              idUsuario,
              idCliente
            )
        )
      );
    } catch (error) {
      throw new Error(
        resolveApiError(
          error,
          ZONAS_ERROR_MESSAGES.available
        )
      );
    }
  };

export const fetchZonasAsignadasByClienteUsuario =
  async (
    idCliente: number,
    idUsuario: number,
    signal?: AbortSignal
  ): Promise<UsuarioZonaItem[]> => {
    const query = buildZonasQuery(
      idCliente,
      idUsuario
    );

    try {
      const result =
        await apiClient<
          GetZonasAsignadasApiResponse
        >(
          `${
            GESTION_USUARIOS_API_ENDPOINTS
              .getZonasAsignadasByClienteUsuario
          }?${query}`,
          {
            signal,
            cache: 'no-store',
          }
        );

      assertApiBusinessSuccess(
        result,
        ZONAS_ERROR_MESSAGES.assigned
      );

      return sortUsuarioZonas(
        (result.response ?? []).map(
          mapUsuarioZonaAsignada
        )
      );
    } catch (error) {
      throw new Error(
        resolveApiError(
          error,
          ZONAS_ERROR_MESSAGES.assigned
        )
      );
    }
  };

const requireAsignacionId = (
  zona: UsuarioZonaItem
): number => {
  const idAsignacion =
    zona.idAsignacion;

  if (
    idAsignacion === null ||
    !Number.isInteger(idAsignacion) ||
    idAsignacion <= 0
  ) {
    throw new Error(
      `La API no devolvió un nid_asignacion válido para la zona "${assertZona(zona.zona)}".`
    );
  }

  return idAsignacion;
};

const buildMutationBody = (
  zona: UsuarioZonaItem,
  bestado: boolean,
  operation: 'create' | 'update'
): UsuarioZonaMutationRequestApi => {
  assertPositiveId(
    zona.idUsuario,
    'El identificador del usuario'
  );
  assertPositiveId(
    zona.idCliente,
    'El identificador del cliente'
  );

  return {
    // POST crea una relación; PUT usa la PK real devuelta por la API.
    nid_asignacion:
      operation === 'create'
        ? 0
        : requireAsignacionId(zona),
    nid_usuario: zona.idUsuario,
    nid_cliente: zona.idCliente,
    zona: assertZona(zona.zona),
    bestado,
  };
};

export const createUsuarioZona = async (
  zona: UsuarioZonaItem
): Promise<void> => {
  const body = buildMutationBody(
    zona,
    true,
    'create'
  );

  try {
    const result =
      await apiClient<
        UsuarioZonaMutationApiResponse
      >(
        GESTION_USUARIOS_API_ENDPOINTS
          .createAsignaUsuario,
        {
          method: 'POST',
          body,
        }
      );

    assertApiBusinessSuccess(
      result,
      ZONAS_ERROR_MESSAGES.create
    );
  } catch (error) {
    throw new Error(
      resolveApiError(
        error,
        ZONAS_ERROR_MESSAGES.create
      )
    );
  }
};

export const updateUsuarioZona = async (
  zona: UsuarioZonaItem,
  bestado: boolean
): Promise<void> => {
  const body = buildMutationBody(
    zona,
    bestado,
    'update'
  );

  try {
    const result =
      await apiClient<
        UsuarioZonaMutationApiResponse
      >(
        GESTION_USUARIOS_API_ENDPOINTS
          .editAsignaUsuario,
        {
          method: 'PUT',
          body,
        }
      );

    assertApiBusinessSuccess(
      result,
      ZONAS_ERROR_MESSAGES.update
    );
  } catch (error) {
    throw new Error(
      resolveApiError(
        error,
        ZONAS_ERROR_MESSAGES.update
      )
    );
  }
};
