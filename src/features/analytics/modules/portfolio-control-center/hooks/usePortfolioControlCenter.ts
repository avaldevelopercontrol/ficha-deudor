import { useCallback } from 'react';

import {
  useAsyncResource,
} from '@shared/hooks/useAsyncResource';
import type {
  PortfolioControlCenterData,
  PortfolioControlCenterFilters,
} from '../../../types/portfolioControlCenter.types';
import {
  DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
  PORTFOLIO_CONTROL_CENTER_ERROR_MESSAGE,
} from '../constants/portfolioControlCenter.constants';
import {
  loadPortfolioControlCenter,
} from '../services/portfolioControlCenter.service';

export const usePortfolioControlCenter = (
  filters: PortfolioControlCenterFilters =
    DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS
) => {
  const loader = useCallback(
    (signal: AbortSignal) =>
      loadPortfolioControlCenter(
        filters,
        signal
      ),
    [filters]
  );

  return useAsyncResource<
    PortfolioControlCenterData | null
  >({
    loader,
    resourceKey: [
      filters.dateFrom,
      filters.dateTo,
      filters.subPortfolioId,
      filters.campaignId,
      filters.supervisorId,
    ],
    initialData: null,
    initialLoading: true,
    errorMessage:
      PORTFOLIO_CONTROL_CENTER_ERROR_MESSAGE,
  });
};
