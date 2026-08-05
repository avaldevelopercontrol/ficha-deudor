import { isAbortError } from '@shared/utils/asyncResource.utils';

import type { LoginPayload, LoginResponse } from '../types';

export type LoginRequestExecutor = (
  payload: LoginPayload,
  signal: AbortSignal
) => Promise<LoginResponse>;

export type LoginRequestOutcome =
  | {
      status: 'completed';
      response: LoginResponse;
    }
  | {
      status: 'cancelled';
    };

export interface LoginRequestController {
  execute: (payload: LoginPayload) => Promise<LoginRequestOutcome>;
  cancel: () => void;
  isPending: () => boolean;
}

interface ActiveLoginRequest {
  payload: LoginPayload;
  controller: AbortController;
  promise: Promise<LoginRequestOutcome>;
  requestId: number;
}

const isSameLoginPayload = (
  current: LoginPayload,
  next: LoginPayload
): boolean =>
  current.username === next.username &&
  current.password === next.password;

/**
 * Mantiene una sola autenticación vigente.
 *
 * Una repetición exacta comparte la promesa en curso para evitar dos llamadas
 * al backend. Si cambian las credenciales, la autenticación anterior se
 * invalida y se inicia una nueva con su propio AbortSignal.
 */
export const createLoginRequestController = (
  executor: LoginRequestExecutor
): LoginRequestController => {
  let activeRequest: ActiveLoginRequest | null = null;
  let latestRequestId = 0;

  const cancel = () => {
    latestRequestId += 1;
    activeRequest?.controller.abort();
    activeRequest = null;
  };

  const execute = (payload: LoginPayload): Promise<LoginRequestOutcome> => {
    if (
      activeRequest &&
      isSameLoginPayload(activeRequest.payload, payload)
    ) {
      return activeRequest.promise;
    }

    activeRequest?.controller.abort();

    const controller = new AbortController();
    const requestId = ++latestRequestId;
    const requestPayload = { ...payload };

    const promise = (async (): Promise<LoginRequestOutcome> => {
      try {
        const response = await executor(
          requestPayload,
          controller.signal
        );

        if (
          controller.signal.aborted ||
          requestId !== latestRequestId
        ) {
          return { status: 'cancelled' };
        }

        return {
          status: 'completed',
          response,
        };
      } catch (error) {
        if (
          controller.signal.aborted ||
          requestId !== latestRequestId ||
          isAbortError(error)
        ) {
          return { status: 'cancelled' };
        }

        throw error;
      } finally {
        if (activeRequest?.requestId === requestId) {
          activeRequest = null;
        }
      }
    })();

    activeRequest = {
      payload: requestPayload,
      controller,
      promise,
      requestId,
    };

    return promise;
  };

  return {
    execute,
    cancel,
    isPending: () => activeRequest !== null,
  };
};
