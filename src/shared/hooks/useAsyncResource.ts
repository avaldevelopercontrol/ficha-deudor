import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  createAsyncResourceController,
} from '../utils/asyncResource.utils';
import {
  createStableKey,
  type StableKeyPart,
} from '../utils/stableKey.utils';

export type AsyncResourceKeyPart = StableKeyPart;

interface UseAsyncResourceParams<T> {
  loader: (
    signal: AbortSignal
  ) => Promise<T>;
  resourceKey: readonly AsyncResourceKeyPart[];
  initialData: T;
  errorMessage: string;
  enabled?: boolean;
  initialLoading?: boolean;
  disabledError?: string | null;
  clearDataOnError?: boolean;
  resetDataWhenDisabled?: boolean;
}

interface UseAsyncResourceReturn<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  cancel: () => void;
  setData: Dispatch<SetStateAction<T>>;
  setError: Dispatch<SetStateAction<string | null>>;
}

export const createAsyncResourceKey = createStableKey;

export function useAsyncResource<T>({
  loader,
  resourceKey,
  initialData,
  errorMessage,
  enabled = true,
  initialLoading = false,
  disabledError = null,
  clearDataOnError = true,
  resetDataWhenDisabled = true,
}: UseAsyncResourceParams<T>): UseAsyncResourceReturn<T> {
  const initialDataRef = useRef(initialData);
  const loaderRef = useRef(loader);
  const controllerRef = useRef(
    createAsyncResourceController<T>()
  );

  const [data, setData] = useState<T>(
    () => initialData
  );
  const [isLoading, setIsLoading] =
    useState(initialLoading);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const resourceKeyValue =
    createAsyncResourceKey(resourceKey);

  const executeRequest = useCallback(
    async () => {
      if (!enabled) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const result =
        await controllerRef.current.execute(
          (signal) => loaderRef.current(signal)
        );

      if (result.status === 'aborted') {
        return;
      }

      if (result.status === 'success') {
        setData(result.data);
        setIsLoading(false);
        setError(null);
        return;
      }

      if (clearDataOnError) {
        setData(initialDataRef.current);
      }

      setIsLoading(false);
      setError(
        result.error instanceof Error
          ? result.error.message
          : errorMessage
      );
    }, [
      clearDataOnError,
      enabled,
      errorMessage,
    ]
  );

  useEffect(() => {
    const controller = controllerRef.current;

    if (!enabled) {
      controller.cancel();

      if (resetDataWhenDisabled) {
        setData(initialDataRef.current);
      }

      setIsLoading(false);
      setError(disabledError);
      return;
    }

    void executeRequest();

    return () => {
      controller.cancel();
    };
  }, [
    disabledError,
    enabled,
    executeRequest,
    resetDataWhenDisabled,
    resourceKeyValue,
  ]);

  const refetch = useCallback(async () => {
    await executeRequest();
  }, [executeRequest]);

  const cancel = useCallback(() => {
    controllerRef.current.cancel();
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
    cancel,
    setData,
    setError,
  };
}
