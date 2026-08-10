export type AsyncMutationResult<T> =
  | {
      status: 'success';
      data: T;
    }
  | {
      status: 'error';
      error: unknown;
    }
  | {
      status: 'skipped';
    };

export interface AsyncMutationController {
  isPending: () => boolean;
  execute: <T>(
    operation: () => Promise<T>
  ) => Promise<AsyncMutationResult<T>>;
}

/**
 * Controla una única mutación en curso.
 *
 * El bloqueo se activa de forma síncrona antes de ejecutar la operación,
 * por lo que dos llamadas consecutivas en el mismo ciclo no pueden iniciar
 * dos solicitudes al backend.
 */
export const createAsyncMutationController =
  (): AsyncMutationController => {
    let isPending = false;

    return {
      isPending: () => isPending,

      execute: async <T>(
        operation: () => Promise<T>
      ): Promise<AsyncMutationResult<T>> => {
        if (isPending) {
          return {
            status: 'skipped',
          };
        }

        isPending = true;

        try {
          const data = await operation();

          return {
            status: 'success',
            data,
          };
        } catch (error) {
          return {
            status: 'error',
            error,
          };
        } finally {
          isPending = false;
        }
      },
    };
  };
