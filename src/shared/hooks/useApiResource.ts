import {
  useAsyncResource,
  type AsyncResourceKeyPart,
} from './useAsyncResource';

interface UseApiResourceState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiResourceReturn<T>
  extends UseApiResourceState<T> {
  refetch: () => void;
}

interface UseApiResourceOptions {
  enabled?: boolean;
  initialLoading?: boolean;
  errorMessage?: string;
  disabledError?: string | null;
  clearDataOnError?: boolean;
  resetDataWhenDisabled?: boolean;
}

export function useApiResource<T>(
  fetcher: (
    signal: AbortSignal
  ) => Promise<T>,
  deps: readonly AsyncResourceKeyPart[],
  {
    enabled = true,
    initialLoading = true,
    errorMessage = 'Error al cargar información',
    disabledError = null,
    clearDataOnError = true,
    resetDataWhenDisabled = true,
  }: UseApiResourceOptions = {}
): UseApiResourceReturn<T> {
  const resource = useAsyncResource<T | null>({
    loader: fetcher,
    resourceKey: deps,
    initialData: null,
    errorMessage,
    enabled,
    initialLoading,
    disabledError,
    clearDataOnError,
    resetDataWhenDisabled,
  });

  return {
    data: resource.data,
    isLoading: resource.isLoading,
    error: resource.error,
    refetch: () => {
      void resource.refetch();
    },
  };
}
