import {
  apiClient,
} from '@shared/api/apiClient';
import {
  assertApiBusinessSuccess,
  unwrapApiObjectResponse,
} from '@shared/api/apiResponse.utils';

import {
  SEGURIDAD_API_ENDPOINTS,
} from '../constants/seguridadRoutes.constants';
import type {
  CreateUsuarioGrupoOpcionApiResponse,
  CreateUsuarioGrupoOpcionRequest,
  UpdateUsuarioGrupoOpcionApiResponse,
  UpdateUsuarioGrupoOpcionRequest,
  UsuarioGrupoOpcionMutationResponseApi,
} from '../types/usuarioGrupoOpcion.types';
import {
  resolveSeguridadApiError,
} from './seguridadApiError';

const ERROR_MESSAGES = {
  create:
    'No se pudieron registrar los accesos del usuario.',
  update:
    'No se pudieron actualizar los accesos del usuario.',
} as const;

const assertMutationResponse = (
  response: UsuarioGrupoOpcionMutationResponseApi,
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
    response.nId_Usuario !== request.nId_Usuario ||
    response.nId_Grupo !== request.nId_Grupo ||
    response.nId_Opcion !== request.nId_Opcion ||
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

  assertApiBusinessSuccess(
    result,
    ERROR_MESSAGES.create
  );

  const response =
    unwrapApiObjectResponse<UsuarioGrupoOpcionMutationResponseApi>(
      result,
      ERROR_MESSAGES.create
    );

  assertMutationResponse(response, request);
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

  assertApiBusinessSuccess(
    result,
    ERROR_MESSAGES.update
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

export const executeUsuarioGrupoOpcionMutationPlan = async (
  updateRequests:
    readonly UpdateUsuarioGrupoOpcionRequest[],
  createRequests:
    readonly CreateUsuarioGrupoOpcionRequest[],
  signal?: AbortSignal
): Promise<void> => {
  const operations: MutationOperation[] = [
    ...updateRequests.map((request) => ({
      type: 'actualizar' as const,
      optionId: request.nId_Opcion,
      execute: () =>
        updateUsuarioGrupoOpcion(
          request,
          signal
        ),
    })),
    ...createRequests.map((request) => ({
      type: 'registrar' as const,
      optionId: request.nId_Opcion,
      execute: () =>
        createUsuarioGrupoOpcion(
          request,
          signal
        ),
    })),
  ];

  let completed = 0;

  for (const operation of operations) {
    try {
      await operation.execute();
      completed += 1;
    } catch (error) {
      const resolvedError =
        resolveSeguridadApiError(
          error,
          operation.type === 'registrar'
            ? ERROR_MESSAGES.create
            : ERROR_MESSAGES.update
        );

      if (resolvedError.name === 'AbortError') {
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
