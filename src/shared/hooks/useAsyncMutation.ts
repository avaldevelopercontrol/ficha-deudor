import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  createAsyncMutationController,
  type AsyncMutationResult,
} from '../utils/asyncMutation.utils';

interface UseAsyncMutationResult {
  isPending: boolean;
  execute: <T>(
    operation: () => Promise<T>
  ) => Promise<AsyncMutationResult<T>>;
}

/**
 * Ejecuta mutaciones asíncronas con protección contra solicitudes duplicadas.
 */
export const useAsyncMutation =
  (): UseAsyncMutationResult => {
    const controllerRef = useRef(
      createAsyncMutationController()
    );

    const isMountedRef = useRef(true);
    const [isPending, setIsPending] =
      useState(false);

    useEffect(() => {
      isMountedRef.current = true;

      return () => {
        isMountedRef.current = false;
      };
    }, []);

    const execute = useCallback(
      async <T>(
        operation: () => Promise<T>
      ): Promise<AsyncMutationResult<T>> => {
        const controller =
          controllerRef.current;

        if (controller.isPending()) {
          return {
            status: 'skipped',
          };
        }

        if (isMountedRef.current) {
          setIsPending(true);
        }

        const result =
          await controller.execute(operation);

        if (isMountedRef.current) {
          setIsPending(false);
        }

        return result;
      },
      []
    );

    return {
      isPending,
      execute,
    };
  };
