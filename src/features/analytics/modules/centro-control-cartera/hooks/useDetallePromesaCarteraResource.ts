import { useCallback } from 'react';

import { useAsyncResource } from '@shared/hooks/useAsyncResource';

import type {
  DetallePromesaCarteraContext,
} from '../application/promesasCartera.application';

type DetallePromesaCarteraLoader<TData, TQuery> = (
  crmClientId: number,
  context: DetallePromesaCarteraContext,
  query: TQuery,
  signal: AbortSignal
) => Promise<TData>;

interface UseDetallePromesaCarteraResourceParams<TData, TQuery> {
  crmClientId: number;
  context: DetallePromesaCarteraContext | null;
  enabled: boolean;
  query: TQuery;
  queryKey: readonly (string | number | boolean | null | undefined)[];
  load: DetallePromesaCarteraLoader<TData, TQuery>;
  errorMessage: string;
}

export function useDetallePromesaCarteraResource<TData, TQuery>({
  crmClientId,
  context,
  enabled,
  query,
  queryKey,
  load,
  errorMessage,
}: UseDetallePromesaCarteraResourceParams<TData, TQuery>) {
  const loader = useCallback(
    (signal: AbortSignal) => {
      if (!context) {
        return Promise.resolve<TData | null>(null);
      }

      return load(crmClientId, context, query, signal);
    }, [context, crmClientId, load, query]
  );

  return useAsyncResource<TData | null>({
    loader,
    resourceKey: [
      crmClientId,
      context?.businessUnit ?? null,
      context?.campaignId ?? null,
      context?.subPortfolioId ?? null,
      ...queryKey,
    ],
    initialData: null,
    initialLoading: enabled,
    errorMessage,
    enabled: enabled && context !== null,
    resetDataWhenDisabled: true,
  });
}
