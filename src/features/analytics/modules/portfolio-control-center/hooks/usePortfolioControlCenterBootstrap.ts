import {
  useCallback,
  useRef,
  useState,
} from 'react';

import {
  useAsyncResource,
} from '@shared/hooks/useAsyncResource';
import type {
  PortfolioControlCenterData,
  PortfolioControlCenterFilterOptions,
  PortfolioControlCenterFilters,
} from '../../../types/portfolioControlCenter.types';
import {
  PORTFOLIO_CONTROL_CENTER_ERROR_MESSAGE,
} from '../constants/portfolioControlCenter.constants';
import {
  getPortfolioControlCenterResourceKey,
  resolvePortfolioControlCenterLoadMode,
} from '../utils/portfolioControlCenterRequest.utils';
import {
  loadPortfolioControlCenter,
  loadPortfolioControlCenterBootstrap,
} from '../services/portfolioControlCenter.service';

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
  const filterOptionsLoadedRef = useRef(false);
  const forceBootstrapRef = useRef(false);
  const selectedBusinessUnitRef = useRef<string | null>(null);
  const currentCampaignUnavailableRef = useRef(false);
  const [filterOptions, setFilterOptions] =
    useState<PortfolioControlCenterFilterOptions>(
      EMPTY_FILTER_OPTIONS
    );
  const [filterOptionsLoaded, setFilterOptionsLoaded] =
    useState(false);

  const loader = useCallback(
    async (signal: AbortSignal) => {
      const loadMode =
        resolvePortfolioControlCenterLoadMode({
          filterOptionsLoaded:
            filterOptionsLoadedRef.current,
          forceBootstrap:
            forceBootstrapRef.current,
          selectedBusinessUnit:
            selectedBusinessUnitRef.current,
          requestedBusinessUnit:
            filters.businessUnit,
          currentCampaignUnavailable:
            currentCampaignUnavailableRef.current,
          requestedCampaignId: filters.campaignId,
        });

      forceBootstrapRef.current = false;

      if (loadMode === 'bootstrap') {
        const bootstrap =
          await loadPortfolioControlCenterBootstrap(
            crmClientId,
            filters,
            signal
          );

        if (!signal.aborted) {
          filterOptionsLoadedRef.current = true;
          selectedBusinessUnitRef.current =
            bootstrap.filterOptions.selectedBusinessUnit;
          if (
            filters.campaignId === null &&
            filters.subPortfolioId === null
          ) {
            currentCampaignUnavailableRef.current =
              bootstrap.data === null;
          }
          setFilterOptions(bootstrap.filterOptions);
          setFilterOptionsLoaded(true);
        }

        return bootstrap.data;
      }

      return loadPortfolioControlCenter(
        crmClientId,
        {
          ...filters,
          businessUnit:
            filters.businessUnit ??
            selectedBusinessUnitRef.current,
        },
        signal
      );
    },
    [crmClientId, filters]
  );

  const resource = useAsyncResource<
    PortfolioControlCenterData | null
  >({
    loader,
    resourceKey:
      getPortfolioControlCenterResourceKey(
        crmClientId,
        filters
      ),
    initialData: null,
    initialLoading: true,
    errorMessage:
      PORTFOLIO_CONTROL_CENTER_ERROR_MESSAGE,
  });

  const refetchResource = resource.refetch;

  const refetchFilterOptions = useCallback(async () => {
    forceBootstrapRef.current = true;
    await refetchResource();
  }, [refetchResource]);

  const requestedBusinessUnit =
    filters.businessUnit?.trim() || null;
  const filterOptionsBusinessUnitStale =
    requestedBusinessUnit !== null &&
    requestedBusinessUnit !==
      filterOptions.selectedBusinessUnit;
  const filterOptionsUnavailable =
    !filterOptionsLoaded ||
    filterOptionsBusinessUnitStale;

  return {
    ...resource,
    filterOptions,
    areFiltersLoading:
      filterOptionsUnavailable &&
      resource.error === null,
    filterOptionsError:
      filterOptionsUnavailable
        ? resource.error
        : null,
    refetchFilterOptions,
  };
};
