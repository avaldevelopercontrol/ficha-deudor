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

import {
  buildCreateUsuarioGrupoOpcionRequests,
  buildUsuarioGrupoOpcionAddPlan,
  buildUsuarioGrupoOpcionSyncPlan,
} from '../mappers/usuarioGrupoOpcionMutation.mapper';

import type {
  RegistrarUsuarioGrupoOpcionesData,
} from '../modules/mantener-accesos-usuario/types/asignarAccesosUsuario.types';

import type {
  CreateUsuarioGrupoOpcionApiResponse,
  CreateUsuarioGrupoOpcionRequest,
  GetUsuarioGrupoOpcionDetalleResponse,
  GetUsuarioGrupoOpcionListadoResponse,
  UpdateUsuarioGrupoOpcionApiResponse,
  UpdateUsuarioGrupoOpcionRequest,
  UsuarioGrupoOpcionDetalle,
  UsuarioGrupoOpcionDetalleApi,
  UsuarioGrupoOpcionListado,
  UsuarioGrupoOpcionListadoApi,
  UsuarioGrupoOpcionMutationResponseApi,
  UsuarioGrupoOpcionPermiso,
} from '../types/usuarioGrupoOpcion.types';

const FETCH_PAGE_NUMBER = 1;
const FETCH_PAGE_SIZE = 1000;

const ERROR_MESSAGES = {
  list:
    'No se pudo obtener la lista de accesos por usuario.',
  detail:
    'No se pudo obtener el acceso del usuario.',
  byUserGroup:
    'No se pudieron obtener los accesos del usuario para el grupo seleccionado.',
  create:
    'No se pudieron registrar los accesos del usuario.',
  update:
    'No se pudieron actualizar los accesos del usuario.',
} as const;

interface UsuarioGrupoOpcionListPage {
  items: UsuarioGrupoOpcionListado[];
  totalPages: number;
}

interface UsuarioGrupoOpcionByUserGroupPage {
  items: UsuarioGrupoOpcionListadoApi[];
  totalPages: number;
}

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const resolveUsuarioGrupoOpcionError = (
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
  const searchParams =
    new URLSearchParams({
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

  assertApiSuccess(
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
    totalPages:
      normalizeTotalPages(
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
      firstPageNumber:
        FETCH_PAGE_NUMBER,
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
    throw resolveUsuarioGrupoOpcionError(
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

    const response =
      unwrapApiObjectResponse<UsuarioGrupoOpcionDetalleApi>(
        result,
        ERROR_MESSAGES.detail
      );
    const detail =
      mapUsuarioGrupoOpcionDetalle(
        response
      );

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
    throw resolveUsuarioGrupoOpcionError(
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
          nId_Usuario:
            String(usuarioId),
          nId_Grupo:
            String(grupoId),
        }
      ),
      {
        method: 'GET',
        signal,
      }
    );

  assertApiSuccess(
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
    totalPages:
      normalizeTotalPages(
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
      firstPageNumber:
        FETCH_PAGE_NUMBER,
      fetchPage: (pageNumber) =>
        fetchByUserGroupPage(
          usuarioId,
          grupoId,
          pageNumber,
          signal
        ),
      getItems: (page) =>
        page.items,
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
  const normalizedUsuarioId =
    toRequiredId(
      usuarioId,
      'nId_Usuario'
    );
  const normalizedGrupoId =
    toRequiredId(
      grupoId,
      'nId_Grupo'
    );

  try {
    const assignments =
      (
        await fetchUsuarioGrupoOpcionesRawByUsuarioGrupo(
          normalizedUsuarioId,
          normalizedGrupoId,
          signal
        )
      ).map(
        mapUsuarioGrupoOpcionPermiso
      );

    assertUniqueOptionIds(
      assignments.map(
        (assignment) =>
          assignment.idOpcion
      )
    );

    return assignments;
  } catch (error) {
    throw resolveUsuarioGrupoOpcionError(
      error,
      ERROR_MESSAGES.byUserGroup
    );
  }
};

const hasValidCreationAudit = (
  item: UsuarioGrupoOpcionListadoApi
): boolean =>
  isPositiveIntegerValue(
    item.nCrea
  ) &&
  typeof item.dFechaCrea === 'string' &&
  Boolean(item.dFechaCrea.trim());

const hydrateUsuarioGrupoOpcionDetalle = async (
  item: UsuarioGrupoOpcionListadoApi,
  signal?: AbortSignal
): Promise<UsuarioGrupoOpcionDetalle> => {
  if (hasValidCreationAudit(item)) {
    return mapUsuarioGrupoOpcionDetalle(
      item
    );
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
  const normalizedUsuarioId =
    toRequiredId(
      usuarioId,
      'nId_Usuario'
    );
  const normalizedGrupoId =
    toRequiredId(
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

    assignments.forEach(
      (assignment) => {
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
      }
    );

    assertUniqueOptionIds(
      assignments.map(
        (assignment) =>
          assignment.idOpcion
      )
    );

    return assignments;
  } catch (error) {
    throw resolveUsuarioGrupoOpcionError(
      error,
      ERROR_MESSAGES.byUserGroup
    );
  }
};

const assertMutationResponse = (
  response:
    UsuarioGrupoOpcionMutationResponseApi,
  request:
    | CreateUsuarioGrupoOpcionRequest
    | UpdateUsuarioGrupoOpcionRequest,
  expectedAssignmentId?: number
): void => {
  if (
    !Number.isSafeInteger(
      response.nId_UsuarioGrupoOpcion
    ) ||
    response.nId_UsuarioGrupoOpcion <= 0 ||
    response.nId_Usuario !==
      request.nId_Usuario ||
    response.nId_Grupo !==
      request.nId_Grupo ||
    response.nId_Opcion !==
      request.nId_Opcion ||
    (
      expectedAssignmentId !== undefined &&
      response.nId_UsuarioGrupoOpcion !==
        expectedAssignmentId
    )
  ) {
    throw new Error(
      'El servidor no confirmó correctamente el acceso del usuario.'
    );
  }
};

const createUsuarioGrupoOpcion = async (
  request: CreateUsuarioGrupoOpcionRequest,
  signal?: AbortSignal
): Promise<void> => {
  const result =
    await apiClient<CreateUsuarioGrupoOpcionApiResponse>(
      SEGURIDAD_API_ENDPOINTS
        .usuarioGrupoOpciones,
      {
        method: 'POST',
        body: request,
        signal,
      }
    );

  const response =
    unwrapApiObjectResponse<UsuarioGrupoOpcionMutationResponseApi>(
      result,
      ERROR_MESSAGES.create
    );

  assertMutationResponse(
    response,
    request
  );
};

const updateUsuarioGrupoOpcion = async (
  request: UpdateUsuarioGrupoOpcionRequest,
  signal?: AbortSignal
): Promise<void> => {
  const result =
    await apiClient<UpdateUsuarioGrupoOpcionApiResponse>(
      SEGURIDAD_API_ENDPOINTS
        .usuarioGrupoOpciones,
      {
        method: 'PUT',
        body: request,
        signal,
      }
    );

  const response =
    unwrapApiObjectResponse<UsuarioGrupoOpcionMutationResponseApi>(
      result,
      ERROR_MESSAGES.update
    );

  assertMutationResponse(
    response,
    request,
    request.nId_UsuarioGrupoOpcion
  );
};

interface MutationOperation {
  type: 'registrar' | 'actualizar';
  optionId: number;
  execute: () => Promise<void>;
}

const executeMutationPlan = async (
  updateRequests:
    readonly UpdateUsuarioGrupoOpcionRequest[],
  createRequests:
    readonly CreateUsuarioGrupoOpcionRequest[],
  signal?: AbortSignal
): Promise<void> => {
  const operations: MutationOperation[] = [
    ...updateRequests.map(
      (request) => ({
        type: 'actualizar' as const,
        optionId: request.nId_Opcion,
        execute: () =>
          updateUsuarioGrupoOpcion(
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
          createUsuarioGrupoOpcion(
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
        resolveUsuarioGrupoOpcionError(
          error,
          operation.type === 'registrar'
            ? ERROR_MESSAGES.create
            : ERROR_MESSAGES.update
        );

      if (
        resolvedError.name ===
        'AbortError'
      ) {
        throw resolvedError;
      }

      if (completed > 0) {
        throw new Error(
          `Se procesaron ${completed} de ${operations.length} cambios. No se pudo ${operation.type} la opción ${operation.optionId}: ${resolvedError.message} Cierre el modal y revise los accesos antes de volver a intentar.`
        );
      }

      throw resolvedError;
    }
  }
};

export const addUsuarioGrupoOpciones = async (
  existingAssignments:
    readonly UsuarioGrupoOpcionDetalle[],
  data: RegistrarUsuarioGrupoOpcionesData,
  authenticatedUserId: string,
  signal?: AbortSignal
): Promise<void> => {
  const plan =
    buildUsuarioGrupoOpcionAddPlan(
      existingAssignments,
      data,
      authenticatedUserId
    );

  const createRequests =
    plan.newAssignments.length > 0
      ? buildCreateUsuarioGrupoOpcionRequests(
          {
            ...data,
            assignments:
              plan.newAssignments,
          },
          authenticatedUserId
        )
      : [];

  await executeMutationPlan(
    plan.updateRequests,
    createRequests,
    signal
  );
};

export const syncUsuarioGrupoOpciones = async (
  existingAssignments:
    readonly UsuarioGrupoOpcionDetalle[],
  data: RegistrarUsuarioGrupoOpcionesData,
  authenticatedUserId: string,
  signal?: AbortSignal
): Promise<void> => {
  const plan =
    buildUsuarioGrupoOpcionSyncPlan(
      existingAssignments,
      data,
      authenticatedUserId
    );

  const createRequests =
    plan.newAssignments.length > 0
      ? buildCreateUsuarioGrupoOpcionRequests(
          {
            ...data,
            assignments:
              plan.newAssignments,
          },
          authenticatedUserId
        )
      : [];

  await executeMutationPlan(
    plan.updateRequests,
    createRequests,
    signal
  );
};
