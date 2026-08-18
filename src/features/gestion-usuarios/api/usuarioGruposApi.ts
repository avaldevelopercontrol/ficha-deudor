import {
  ApiError,
  apiClient,
} from '@shared/api/apiClient';

import {
  GESTION_USUARIOS_API_ENDPOINTS,
} from '../constants/gestionUsuariosRoutes.constants';

import {
  mapUsuarioGrupoAsignado,
  mapUsuarioGrupoFaltante,
} from '../mappers/editarUsuario.mapper';

import type {
  UsuarioGrupoItem,
} from '../modules/mantener-usuario/types/editarUsuario.types';

import type {
  CreateUsuarioGrupoRequestApi,
  GetGruposByUsuarioApiResponse,
  GetGruposFaltantesByUsuarioApiResponse,
  UpdateUsuarioGrupoRequestApi,
  UsuarioGrupoMutationApiResponse,
} from '../types/editarUsuario.types';

const PAGE_NUMBER = 1;
const PAGE_SIZE = 1000;

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
      (error.message.trim() ||
        fallback)
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

const assertUsuarioId = (
  idUsuario: number
): void => {
  if (
    !Number.isInteger(idUsuario) ||
    idUsuario <= 0
  ) {
    throw new Error(
      'El identificador del usuario no es válido para consultar sus grupos.'
    );
  }
};

const assertSuccessfulResponse = (
  result: {
    statusCode: number;
    code: string;
    message?: string;
    messageUser?: string;
  },
  fallback: string
): void => {
  const normalizedCode =
    result.code?.trim();

  const success =
    (normalizedCode === '00' ||
      normalizedCode === '200') &&
    (result.statusCode === 0 ||
      (result.statusCode >= 200 &&
        result.statusCode < 300));

  if (success) {
    return;
  }

  throw new Error(
    result.messageUser?.trim() ||
      result.message?.trim() ||
      fallback
  );
};

const buildUsuarioGroupQuery = (
  idUsuario: number
): string => {
  assertUsuarioId(idUsuario);

  return new URLSearchParams({
    nId_Usuario: String(idUsuario),
    PageNumber: String(PAGE_NUMBER),
    PageSize: String(PAGE_SIZE),
  }).toString();
};

export const fetchGruposByUsuario = async (
  idUsuario: number,
  signal?: AbortSignal
): Promise<UsuarioGrupoItem[]> => {
  const query =
    buildUsuarioGroupQuery(
      idUsuario
    );

  try {
    const result =
      await apiClient<
        GetGruposByUsuarioApiResponse
      >(
        `${
          GESTION_USUARIOS_API_ENDPOINTS
            .getGruposByUsuario
        }?${query}`,
        {
          signal,
          cache: 'no-store',
        }
      );

    assertSuccessfulResponse(
      result,
      'No se pudieron cargar los grupos asignados.'
    );

    return (result.response ?? [])
      .map(mapUsuarioGrupoAsignado)
      .sort((first, second) =>
        first.nombre.localeCompare(
          second.nombre,
          'es',
          {
            sensitivity: 'base',
          }
        )
      );
  } catch (error) {
    throw new Error(
      resolveApiError(
        error,
        'No se pudieron cargar los grupos asignados.'
      )
    );
  }
};

export const fetchGruposFaltantesByUsuario =
  async (
    idUsuario: number,
    signal?: AbortSignal
  ): Promise<UsuarioGrupoItem[]> => {
    const query =
      buildUsuarioGroupQuery(
        idUsuario
      );

    try {
      const result =
        await apiClient<
          GetGruposFaltantesByUsuarioApiResponse
        >(
          `${
            GESTION_USUARIOS_API_ENDPOINTS
              .getGruposFaltantesByUsuario
          }?${query}`,
          {
            signal,
            cache: 'no-store',
          }
        );

      assertSuccessfulResponse(
        result,
        'No se pudieron cargar los grupos disponibles.'
      );

      return (result.response ?? [])
        .map(
          mapUsuarioGrupoFaltante
        )
        .sort((first, second) =>
          first.nombre.localeCompare(
            second.nombre,
            'es',
            {
              sensitivity: 'base',
            }
          )
        );
    } catch (error) {
      throw new Error(
        resolveApiError(
          error,
          'No se pudieron cargar los grupos disponibles.'
        )
      );
    }
  };

const getMutationDate = (): string =>
  new Date().toISOString();

export const createUsuarioGrupo = async (
  idUsuario: number,
  idGrupo: number
): Promise<void> => {
  assertUsuarioId(idUsuario);

  if (
    !Number.isInteger(idGrupo) ||
    idGrupo <= 0
  ) {
    throw new Error(
      'El grupo que se intentó agregar no es válido.'
    );
  }

  const now = getMutationDate();

  const body:
    CreateUsuarioGrupoRequestApi = {
      nId_Usuario: idUsuario,
      nId_Grupo: idGrupo,
      dUGrupo_FecIni: now,
      dUGrupo_FecFin: now,
      bEstado: true,
      bActivo: true,
      bGestion: true,
    };

  try {
    const result =
      await apiClient<
        UsuarioGrupoMutationApiResponse
      >(
        GESTION_USUARIOS_API_ENDPOINTS
          .usuarioGrupo,
        {
          method: 'POST',
          body,
        }
      );

    assertSuccessfulResponse(
      result,
      'No se pudo agregar el grupo al usuario.'
    );
  } catch (error) {
    throw new Error(
      resolveApiError(
        error,
        'No se pudo agregar el grupo al usuario.'
      )
    );
  }
};

export const removeUsuarioGrupo = async (
  grupo: UsuarioGrupoItem
): Promise<void> => {
  if (
    grupo.idUsuarioGrupo === null ||
    !Number.isInteger(
      grupo.idUsuarioGrupo
    ) ||
    grupo.idUsuarioGrupo <= 0
  ) {
    throw new Error(
      `No se pudo identificar la asignación del grupo "${grupo.nombre}".`
    );
  }

  assertUsuarioId(grupo.idUsuario);

  const now = getMutationDate();

  const body:
    UpdateUsuarioGrupoRequestApi = {
      nId_UGrupo:
        grupo.idUsuarioGrupo,
      nId_Usuario:
        grupo.idUsuario,
      nId_Grupo:
        grupo.idGrupo,
      dUGrupo_FecIni: now,
      dUGrupo_FecFin: now,
      bEstado: false,
      bActivo: false,
      bGestion: false,
    };

  try {
    const result =
      await apiClient<
        UsuarioGrupoMutationApiResponse
      >(
        GESTION_USUARIOS_API_ENDPOINTS
          .usuarioGrupo,
        {
          method: 'PUT',
          body,
        }
      );

    assertSuccessfulResponse(
      result,
      'No se pudo quitar el grupo del usuario.'
    );
  } catch (error) {
    throw new Error(
      resolveApiError(
        error,
        'No se pudo quitar el grupo del usuario.'
      )
    );
  }
};
