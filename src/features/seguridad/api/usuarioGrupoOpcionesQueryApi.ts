import {
  apiClient,
} from '@shared/api/apiClient';
import {
  assertApiBusinessSuccess,
  normalizeApiCollectionResponse,
  unwrapApiObjectResponse,
} from '@shared/api/apiResponse.utils';
import {
  fetchAllPagesInParallel,
} from '@shared/utils/pagedCollection.utils';
import {
  isPositiveIntegerValue,
  toRequiredId,
} from '@shared/utils/number.utils';

import {
  SEGURIDAD_API_ENDPOINTS,
} from '../constants/seguridadRoutes.constants';
import {
  mapUsuarioGrupoOpcionDetalle,
  mapUsuarioGrupoOpcionPermiso,
  mapUsuarioGrupoOpcionesListadoResponse,
} from '../mappers/usuarioGrupoOpcion.mapper';
import type {
  GetUsuarioGrupoOpcionDetalleResponse,
  GetUsuarioGrupoOpcionListadoResponse,
  UsuarioGrupoOpcionDetalle,
  UsuarioGrupoOpcionDetalleApi,
  UsuarioGrupoOpcionListado,
  UsuarioGrupoOpcionListadoApi,
  UsuarioGrupoOpcionPermiso,
} from '../types/usuarioGrupoOpcion.types';
import {
  resolveSeguridadApiError,
} from './seguridadApiError';

const FETCH_PAGE_NUMBER = 1;
const FETCH_PAGE_SIZE = 1000;

const ERROR_MESSAGES = {
  list:
    'No se pudo obtener la lista de accesos por usuario.',
  detail:
    'No se pudo obtener el acceso del usuario.',
  byUserGroup:
    'No se pudieron obtener los accesos del usuario para el grupo seleccionado.',
} as const;

interface UsuarioGrupoOpcionListPage {
  items: UsuarioGrupoOpcionListado[];
  totalPages: number;
}

interface UsuarioGrupoOpcionByUserGroupPage {
  items: UsuarioGrupoOpcionListadoApi[];
  totalPages: number;
}

const normalizeTotalPages = (
  value: unknown
): number => {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new Error(
      'La respuesta del servidor no contiene una cantidad de páginas válida.'
    );
  }

  return value;
};

const buildPaginatedEndpoint = (
  endpoint: string,
  pageNumber: number,
  extraParams: Record<string, string> = {}
): string => {
  const searchParams = new URLSearchParams({
    ...extraParams,
    PageNumber: String(pageNumber),
    PageSize: String(FETCH_PAGE_SIZE),
  });

  return `${endpoint}?${searchParams.toString()}`;
};

const fetchListadoPage = async (
  pageNumber: number,
  signal?: AbortSignal
): Promise<UsuarioGrupoOpcionListPage> => {
  const result =
    await apiClient<GetUsuarioGrupoOpcionListadoResponse>(
      buildPaginatedEndpoint(
        SEGURIDAD_API_ENDPOINTS
          .usuarioGrupoOpcionesListado,
        pageNumber
      ),
      {
        method: 'GET',
        signal,
      }
    );

  assertApiBusinessSuccess(
    result,
    ERROR_MESSAGES.list
  );

  const response =
    normalizeApiCollectionResponse<UsuarioGrupoOpcionListadoApi>(
      result.response,
      ERROR_MESSAGES.list
    );

  return {
    items:
      mapUsuarioGrupoOpcionesListadoResponse(
        response
      ),
    totalPages: normalizeTotalPages(
      result.totalPages
    ),
  };
};

export const fetchUsuarioGrupoOpcionesListado = async (
  signal?: AbortSignal
): Promise<UsuarioGrupoOpcionListado[]> => {
  try {
    return await fetchAllPagesInParallel<
      UsuarioGrupoOpcionListPage,
      UsuarioGrupoOpcionListado
    >({
      firstPageNumber: FETCH_PAGE_NUMBER,
      fetchPage: (pageNumber) =>
        fetchListadoPage(
          pageNumber,
          signal
        ),
      getItems: (page) => page.items,
      getTotalPages: (page) =>
        page.totalPages,
    });
  } catch (error) {
    throw resolveSeguridadApiError(
      error,
      ERROR_MESSAGES.list
    );
  }
};

export const fetchUsuarioGrupoOpcionById = async (
  idUsuarioGrupoOpcion: number,
  signal?: AbortSignal
): Promise<UsuarioGrupoOpcionDetalle> => {
  const normalizedId = toRequiredId(
    idUsuarioGrupoOpcion,
    'nId_UsuarioGrupoOpcion'
  );

  try {
    const result =
      await apiClient<GetUsuarioGrupoOpcionDetalleResponse>(
        `${SEGURIDAD_API_ENDPOINTS.usuarioGrupoOpciones}/${normalizedId}`,
        {
          method: 'GET',
          signal,
        }
      );

    assertApiBusinessSuccess(
      result,
      ERROR_MESSAGES.detail
    );

    const response =
      unwrapApiObjectResponse<UsuarioGrupoOpcionDetalleApi>(
        result,
        ERROR_MESSAGES.detail
      );
    const detail =
      mapUsuarioGrupoOpcionDetalle(response);

    if (
      detail.idUsuarioGrupoOpcion !==
      normalizedId
    ) {
      throw new Error(
        'El servidor devolvió un acceso distinto al seleccionado.'
      );
    }

    return detail;
  } catch (error) {
    throw resolveSeguridadApiError(
      error,
      ERROR_MESSAGES.detail
    );
  }
};

const fetchByUserGroupPage = async (
  usuarioId: number,
  grupoId: number,
  pageNumber: number,
  signal?: AbortSignal
): Promise<UsuarioGrupoOpcionByUserGroupPage> => {
  const result =
    await apiClient<GetUsuarioGrupoOpcionListadoResponse>(
      buildPaginatedEndpoint(
        SEGURIDAD_API_ENDPOINTS
          .usuarioGrupoOpcionesPorUsuarioGrupo,
        pageNumber,
        {
          nId_Usuario: String(usuarioId),
          nId_Grupo: String(grupoId),
        }
      ),
      {
        method: 'GET',
        signal,
      }
    );

  assertApiBusinessSuccess(
    result,
    ERROR_MESSAGES.byUserGroup
  );

  const response =
    normalizeApiCollectionResponse<UsuarioGrupoOpcionListadoApi>(
      result.response,
      ERROR_MESSAGES.byUserGroup
    );

  return {
    items: response,
    totalPages: normalizeTotalPages(
      result.totalPages
    ),
  };
};

const fetchUsuarioGrupoOpcionesRawByUsuarioGrupo = async (
  usuarioId: number,
  grupoId: number,
  signal?: AbortSignal
): Promise<UsuarioGrupoOpcionListadoApi[]> => {
  const assignments =
    await fetchAllPagesInParallel<
      UsuarioGrupoOpcionByUserGroupPage,
      UsuarioGrupoOpcionListadoApi
    >({
      firstPageNumber: FETCH_PAGE_NUMBER,
      fetchPage: (pageNumber) =>
        fetchByUserGroupPage(
          usuarioId,
          grupoId,
          pageNumber,
          signal
        ),
      getItems: (page) => page.items,
      getTotalPages: (page) =>
        page.totalPages,
    });

  assignments.forEach((assignment) => {
    if (
      toRequiredId(
        assignment.nId_Usuario,
        'nId_Usuario'
      ) !== usuarioId ||
      toRequiredId(
        assignment.nId_Grupo,
        'nId_Grupo'
      ) !== grupoId
    ) {
      throw new Error(
        'El servidor devolvió accesos que no pertenecen al usuario y grupo solicitados.'
      );
    }
  });

  return assignments;
};

const assertUniqueOptionIds = (
  optionIds: readonly number[]
): void => {
  const seenOptionIds = new Set<number>();

  optionIds.forEach((optionId) => {
    if (seenOptionIds.has(optionId)) {
      throw new Error(
        `La opción ${optionId} está duplicada para el usuario y grupo solicitados.`
      );
    }

    seenOptionIds.add(optionId);
  });
};

export const fetchUsuarioGrupoOpcionesPermisosByUsuarioGrupo = async (
  usuarioId: number,
  grupoId: number,
  signal?: AbortSignal
): Promise<UsuarioGrupoOpcionPermiso[]> => {
  const normalizedUsuarioId = toRequiredId(
    usuarioId,
    'nId_Usuario'
  );
  const normalizedGrupoId = toRequiredId(
    grupoId,
    'nId_Grupo'
  );

  try {
    const assignments = (
      await fetchUsuarioGrupoOpcionesRawByUsuarioGrupo(
        normalizedUsuarioId,
        normalizedGrupoId,
        signal
      )
    ).map(mapUsuarioGrupoOpcionPermiso);

    assertUniqueOptionIds(
      assignments.map(
        (assignment) => assignment.idOpcion
      )
    );

    return assignments;
  } catch (error) {
    throw resolveSeguridadApiError(
      error,
      ERROR_MESSAGES.byUserGroup
    );
  }
};

const hasValidCreationAudit = (
  item: UsuarioGrupoOpcionListadoApi
): boolean =>
  isPositiveIntegerValue(item.nCrea) &&
  typeof item.dFechaCrea === 'string' &&
  Boolean(item.dFechaCrea.trim());

const hydrateUsuarioGrupoOpcionDetalle = async (
  item: UsuarioGrupoOpcionListadoApi,
  signal?: AbortSignal
): Promise<UsuarioGrupoOpcionDetalle> => {
  if (hasValidCreationAudit(item)) {
    return mapUsuarioGrupoOpcionDetalle(item);
  }

  return fetchUsuarioGrupoOpcionById(
    toRequiredId(
      item.nId_UsuarioGrupoOpcion,
      'nId_UsuarioGrupoOpcion'
    ),
    signal
  );
};

export const fetchUsuarioGrupoOpcionesByUsuarioGrupo = async (
  usuarioId: number,
  grupoId: number,
  signal?: AbortSignal
): Promise<UsuarioGrupoOpcionDetalle[]> => {
  const normalizedUsuarioId = toRequiredId(
    usuarioId,
    'nId_Usuario'
  );
  const normalizedGrupoId = toRequiredId(
    grupoId,
    'nId_Grupo'
  );

  try {
    const rawAssignments =
      await fetchUsuarioGrupoOpcionesRawByUsuarioGrupo(
        normalizedUsuarioId,
        normalizedGrupoId,
        signal
      );
    const assignments = await Promise.all(
      rawAssignments.map((assignment) =>
        hydrateUsuarioGrupoOpcionDetalle(
          assignment,
          signal
        )
      )
    );

    assignments.forEach((assignment) => {
      if (
        assignment.idUsuario !==
          normalizedUsuarioId ||
        assignment.idGrupo !==
          normalizedGrupoId
      ) {
        throw new Error(
          'El servidor devolvió accesos que no pertenecen al usuario y grupo solicitados.'
        );
      }
    });

    assertUniqueOptionIds(
      assignments.map(
        (assignment) => assignment.idOpcion
      )
    );

    return assignments;
  } catch (error) {
    throw resolveSeguridadApiError(
      error,
      ERROR_MESSAGES.byUserGroup
    );
  }
};
