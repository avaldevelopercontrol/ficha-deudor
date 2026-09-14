import { useEffect, useMemo } from 'react';

import {
  changeUnidadNegocioCartera,
  changePortfolioCampaign,
  changePortfolioCampaignYear,
  changePortfolioSubPortfolio,
  normalizeFiltroCarteraValue,
  resolveAutomaticPortfolioCampaignSelection,
  resolveFiltrosCarteraViewModel,
} from '../application/filtrosCartera.application';
import type {
  CentroControlCarteraFilterOptions,
  CentroControlCarteraFilters,
  FiltroCarteraOption,
} from '../domain/filtrosCartera.types';

interface UseFiltrosCarteraControllerParams {
  filters: CentroControlCarteraFilters;
  options: CentroControlCarteraFilterOptions;
  portfolioOption: FiltroCarteraOption | null;
  resolvedCampaignId: string | null;
  isLoading: boolean;
  onChange: (filters: CentroControlCarteraFilters) => void;
}

export function useFiltrosCarteraController({
  filters,
  options,
  portfolioOption,
  resolvedCampaignId,
  isLoading,
  onChange,
}: UseFiltrosCarteraControllerParams) {
  const viewModel = useMemo(
    () =>
      resolveFiltrosCarteraViewModel({
        filters,
        options,
        portfolioOption,
        resolvedCampaignId,
      }),
    [filters, options, portfolioOption, resolvedCampaignId]
  );

  useEffect(() => {
    if (
      isLoading ||
      viewModel.isBusinessUnitTransitionPending ||
      viewModel.latestAvailableCampaign === null
    ) {
      return;
    }

    const nextFilters = resolveAutomaticPortfolioCampaignSelection(
      filters,
      options,
      viewModel.latestAvailableCampaign
    );

    if (nextFilters) {
      onChange(nextFilters);
    }
  }, [
    filters,
    isLoading,
    onChange,
    options,
    viewModel.isBusinessUnitTransitionPending,
    viewModel.latestAvailableCampaign,
  ]);

  const updateSubPortfolio = (subPortfolioId: string) => {
    onChange(
      changePortfolioSubPortfolio(
        filters,
        options,
        normalizeFiltroCarteraValue(subPortfolioId)
      )
    );
  };

  const updateBusinessUnit = (businessUnit: string) => {
    if (!viewModel.hasBusinessUnitCatalog) {
      return;
    }

    const nextFilters = changeUnidadNegocioCartera(
      filters,
      normalizeFiltroCarteraValue(businessUnit.trim()),
      viewModel.effectiveBusinessUnit
    );

    if (nextFilters) {
      onChange(nextFilters);
    }
  };

  const updateCampaignYear = (campaignYear: string) => {
    const normalized = normalizeFiltroCarteraValue(campaignYear);

    onChange(
      changePortfolioCampaignYear(
        filters,
        options,
        normalized === null ? null : Number(normalized)
      )
    );
  };

  const updateCampaignMonth = (campaignId: string) => {
    onChange(
      changePortfolioCampaign(
        filters,
        options,
        normalizeFiltroCarteraValue(campaignId)
      )
    );
  };

  const updateDateFrom = (value: string) => {
    onChange({
      ...filters,
      dateFrom: normalizeFiltroCarteraValue(value),
    });
  };

  const updateDateTo = (value: string) => {
    onChange({
      ...filters,
      dateTo: normalizeFiltroCarteraValue(value),
    });
  };

  return {
    viewModel,
    updateSubPortfolio,
    updateBusinessUnit,
    updateCampaignYear,
    updateCampaignMonth,
    updateDateFrom,
    updateDateTo,
  };
}
