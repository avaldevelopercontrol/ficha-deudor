import { useCallback } from 'react';

import { useAsyncResource } from '@shared/hooks/useAsyncResource';

import type {
  PortfolioOperationalContext,
} from '../../../types/portfolioControlCenter.types';

export type PortfolioPromiseDetailContext = Pick<
  PortfolioOperationalContext,
  'businessUnit' | 'campaignId' | 'subPortfolioId'
>;

type PortfolioPromiseDetailLoader<TData, TQuery> = (
  crmClientId: number,
  context: PortfolioPromiseDetailContext,
  query: TQuery,
  signal: AbortSignal
) => Promise<TData>;

interface UsePortfolioPromiseDetailResourceParams<TData, TQuery> {
  crmClientId: number;
  context: PortfolioPromiseDetailContext | null;
  enabled: boolean;
  query: TQuery;
  queryKey: readonly (string | number | boolean | null | undefined)[];
  load: PortfolioPromiseDetailLoader<TData, TQuery>;
  errorMessage: string;
}

export function usePortfolioPromiseDetailResource<TData, TQuery>({
  crmClientId,
  context,
  enabled,
  query,
  queryKey,
  load,
  errorMessage,
}: UsePortfolioPromiseDetailResourceParams<TData, TQuery>) {
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
