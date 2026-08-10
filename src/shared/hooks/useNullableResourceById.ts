import {
  useCallback,
} from 'react';
import {
  useAsyncResource,
} from './useAsyncResource';

export interface NullableResourceByIdState<TData> {
  data: TData | null;
  isLoading: boolean;
  error: string | null;
}

interface UseNullableResourceByIdParams<
  TId extends string | number,
  TData,
> {
  id: TId | null;
  fetcher: (
    id: TId,
    signal: AbortSignal
  ) => Promise<TData>;
  errorMessage: string;
}

export function useNullableResourceById<
  TId extends string | number,
  TData,
>({
  id,
  fetcher,
  errorMessage,
}: UseNullableResourceByIdParams<TId, TData>): NullableResourceByIdState<TData> {
  const loader = useCallback(
    async (
      signal: AbortSignal
    ): Promise<TData | null> => {
      if (id === null) {
        return null;
      }

      return fetcher(id, signal);
    },
    [fetcher, id]
  );

  const resource =
    useAsyncResource<TData | null>({
      loader,
      resourceKey: [id],
      initialData: null,
      errorMessage,
      enabled: id !== null,
    });

  return {
    data: resource.data,
    isLoading: resource.isLoading,
    error: resource.error,
  };
}
