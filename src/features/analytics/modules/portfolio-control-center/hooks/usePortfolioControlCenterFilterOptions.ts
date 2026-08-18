import { useCallback } from 'react';

import {
  useAsyncResource,
} from '@shared/hooks/useAsyncResource';
import type {
  PortfolioControlCenterFilterOptions,
} from '../../../types/portfolioControlCenter.types';
import {
  loadPortfolioControlCenterFilterOptions,
} from '../services/portfolioControlCenter.service';

const EMPTY_FILTER_OPTIONS: PortfolioControlCenterFilterOptions = {
  availableDateFrom: null,
  availableDateTo: null,
  portfolio: null,
  subPortfolios: [],
  campaigns: [],
  supervisors: [],
  availability: {
    subPortfolioCampaigns: [],
    supervisorContexts: [],
  },
};

export const usePortfolioControlCenterFilterOptions = () => {
  const loader = useCallback(
    (signal: AbortSignal) =>
      loadPortfolioControlCenterFilterOptions(
        signal
      ),
    []
  );

  return useAsyncResource<PortfolioControlCenterFilterOptions>({
    loader,
    resourceKey: ['portfolio-control-center-filter-options'],
    initialData: EMPTY_FILTER_OPTIONS,
    initialLoading: true,
    errorMessage:
      'No se pudieron cargar los filtros del Portfolio Control Center.',
  });
};
