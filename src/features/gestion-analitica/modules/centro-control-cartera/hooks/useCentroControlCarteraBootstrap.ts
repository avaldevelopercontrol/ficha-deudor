import { useCallback, useRef, useState } from 'react';

import { useAsyncResource } from '@shared/hooks/useAsyncResource';
import {
  createInicializacionCarteraSession,
  getCentroControlCarteraResourceKey,
  loadCentroControlCarteraResource,
  requestInicializacionCartera,
} from '../application/inicializacionCartera.application';
import {
  CENTRO_CONTROL_CARTERA_ERROR_MESSAGE,
} from '../constants/centroControlCartera.constants';
import type {
  CentroControlCarteraFilterOptions,
  CentroControlCarteraFilters,
} from '../domain/filtrosCartera.types';
import type {
  CentroControlCarteraData,
} from '../domain/panoramaCartera.types';

const EMPTY_FILTER_OPTIONS: CentroControlCarteraFilterOptions = {
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

export const useCentroControlCarteraBootstrap = (
  crmClientId: number,
  filters: CentroControlCarteraFilters
) => {
  const sessionRef = useRef(createInicializacionCarteraSession());
  const [filterOptions, setFilterOptions] =
    useState<CentroControlCarteraFilterOptions>(EMPTY_FILTER_OPTIONS);
  const [filterOptionsLoaded, setFilterOptionsLoaded] =
    useState(false);

  const loader = useCallback(
    async (signal: AbortSignal) => {
      const result = await loadCentroControlCarteraResource(
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

  const resource = useAsyncResource<CentroControlCarteraData | null>({
    loader,
    resourceKey: getCentroControlCarteraResourceKey(
      crmClientId,
      filters
    ),
    initialData: null,
    initialLoading: true,
    errorMessage: CENTRO_CONTROL_CARTERA_ERROR_MESSAGE,
  });

  const refetchResource = resource.refetch;
  const refetchFilterOptions = useCallback(async () => {
    requestInicializacionCartera(sessionRef.current);
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
