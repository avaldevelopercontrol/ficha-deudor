export type AsyncResourceResult<T> =
  | {
      status: 'success';
      data: T;
    }
  | {
      status: 'error';
      error: unknown;
    }
  | {
      status: 'aborted';
    };

export interface AsyncResourceController<T> {
  execute: (
    operation: (
      signal: AbortSignal
    ) => Promise<T>
  ) => Promise<AsyncResourceResult<T>>;
  cancel: () => void;
}

export const isAbortError = (
  error: unknown
): boolean => {
  return (
    error instanceof Error &&
    error.name === 'AbortError'
  );
};

/**
 * Mantiene una sola consulta activa por recurso.
 *
 * Cada nueva ejecución cancela la anterior y recibe un identificador
 * incremental. Aunque una implementación ignore AbortSignal, una respuesta
 * antigua nunca puede considerarse vigente después de iniciar otra consulta.
 */
export const createAsyncResourceController =
  <T>(): AsyncResourceController<T> => {
    let activeController: AbortController | null = null;
    let latestRequestId = 0;

    const cancel = () => {
      latestRequestId += 1;
      activeController?.abort();
      activeController = null;
    };

    const execute = async (
      operation: (
        signal: AbortSignal
      ) => Promise<T>
    ): Promise<AsyncResourceResult<T>> => {
      activeController?.abort();

      const controller = new AbortController();
      const requestId = ++latestRequestId;

      activeController = controller;

      try {
        const data = await operation(
          controller.signal
        );

        if (
          controller.signal.aborted ||
          requestId !== latestRequestId
        ) {
          return {
            status: 'aborted',
          };
        }

        return {
          status: 'success',
          data,
        };
      } catch (error) {
        if (
          controller.signal.aborted ||
          requestId !== latestRequestId ||
          isAbortError(error)
        ) {
          return {
            status: 'aborted',
          };
        }

        return {
          status: 'error',
          error,
        };
      } finally {
        if (
          requestId === latestRequestId &&
          activeController === controller
        ) {
          activeController = null;
        }
      }
    };

    return {
      execute,
      cancel,
    };
  };
