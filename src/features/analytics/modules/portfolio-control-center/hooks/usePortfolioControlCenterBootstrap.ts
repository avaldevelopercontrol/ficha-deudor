import { useCallback, useRef, useState } from 'react';

import { useAsyncResource } from '@shared/hooks/useAsyncResource';
import {
  createPortfolioBootstrapSession,
  getPortfolioControlCenterResourceKey,
  loadPortfolioControlCenterResource,
  requestPortfolioBootstrap,
} from '../application/portfolioBootstrap.application';
import {
  PORTFOLIO_CONTROL_CENTER_ERROR_MESSAGE,
} from '../constants/portfolioControlCenter.constants';
import type {
  PortfolioControlCenterFilterOptions,
  PortfolioControlCenterFilters,
} from '../domain/portfolioFilters.types';
import type {
  PortfolioControlCenterData,
} from '../domain/portfolioOverview.types';

const EMPTY_FILTER_OPTIONS: PortfolioControlCenterFilterOptions = {
  availableDateFrom: null,
  availableDateTo: null,
  portfolio: null,
  businessUnits: [],
  selectedBusinessUnit: null,
  subPortfolios: [],
  campaigns: [],
  supervisors: [],
  availability: {
    subPortfolioCampaigns: [],
    supervisorContexts: [],
  },
};

export const usePortfolioControlCenterBootstrap = (
  crmClientId: number,
  filters: PortfolioControlCenterFilters
) => {
  const sessionRef = useRef(createPortfolioBootstrapSession());
  const [filterOptions, setFilterOptions] =
    useState<PortfolioControlCenterFilterOptions>(EMPTY_FILTER_OPTIONS);
  const [filterOptionsLoaded, setFilterOptionsLoaded] =
    useState(false);

  const loader = useCallback(
    async (signal: AbortSignal) => {
      const result = await loadPortfolioControlCenterResource(
        crmClientId,
        filters,
        sessionRef.current,
        signal
      );

      if (result.filterOptions && !signal.aborted) {
        setFilterOptions(result.filterOptions);
        setFilterOptionsLoaded(true);
      }

      return result.data;
    },
    [crmClientId, filters]
  );

  const resource = useAsyncResource<PortfolioControlCenterData | null>({
    loader,
    resourceKey: getPortfolioControlCenterResourceKey(
      crmClientId,
      filters
    ),
    initialData: null,
    initialLoading: true,
    errorMessage: PORTFOLIO_CONTROL_CENTER_ERROR_MESSAGE,
  });

  const refetchResource = resource.refetch;
  const refetchFilterOptions = useCallback(async () => {
    requestPortfolioBootstrap(sessionRef.current);
    await refetchResource();
  }, [refetchResource]);

  const requestedBusinessUnit = filters.businessUnit?.trim() || null;
  const filterOptionsBusinessUnitStale =
    requestedBusinessUnit !== null &&
    requestedBusinessUnit !== filterOptions.selectedBusinessUnit;
  const filterOptionsUnavailable =
    !filterOptionsLoaded || filterOptionsBusinessUnitStale;

  return {
    ...resource,
    filterOptions,
    areFiltersLoading:
      filterOptionsUnavailable && resource.error === null,
    filterOptionsError:
      filterOptionsUnavailable ? resource.error : null,
    refetchFilterOptions,
  };
};
