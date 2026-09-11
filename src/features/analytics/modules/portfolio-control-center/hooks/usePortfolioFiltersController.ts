import { useEffect, useMemo } from 'react';

import {
  changePortfolioBusinessUnit,
  changePortfolioCampaign,
  changePortfolioCampaignYear,
  changePortfolioSubPortfolio,
  normalizePortfolioFilterValue,
  resolveAutomaticPortfolioCampaignSelection,
  resolvePortfolioFiltersViewModel,
} from '../application/portfolioFilters.application';
import type {
  PortfolioControlCenterFilterOptions,
  PortfolioControlCenterFilters,
  PortfolioFilterOption,
} from '../domain/portfolioFilters.types';

interface UsePortfolioFiltersControllerParams {
  filters: PortfolioControlCenterFilters;
  options: PortfolioControlCenterFilterOptions;
  portfolioOption: PortfolioFilterOption | null;
  resolvedCampaignId: string | null;
  isLoading: boolean;
  onChange: (filters: PortfolioControlCenterFilters) => void;
}

export function usePortfolioFiltersController({
  filters,
  options,
  portfolioOption,
  resolvedCampaignId,
  isLoading,
  onChange,
}: UsePortfolioFiltersControllerParams) {
  const viewModel = useMemo(
    () =>
      resolvePortfolioFiltersViewModel({
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
        normalizePortfolioFilterValue(subPortfolioId)
      )
    );
  };

  const updateBusinessUnit = (businessUnit: string) => {
    if (!viewModel.hasBusinessUnitCatalog) {
      return;
    }

    const nextFilters = changePortfolioBusinessUnit(
      filters,
      normalizePortfolioFilterValue(businessUnit.trim()),
      viewModel.effectiveBusinessUnit
    );

    if (nextFilters) {
      onChange(nextFilters);
    }
  };

  const updateCampaignYear = (campaignYear: string) => {
    const normalized = normalizePortfolioFilterValue(campaignYear);

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
        normalizePortfolioFilterValue(campaignId)
      )
    );
  };

  const updateDateFrom = (value: string) => {
    onChange({
      ...filters,
      dateFrom: normalizePortfolioFilterValue(value),
    });
  };

  const updateDateTo = (value: string) => {
    onChange({
      ...filters,
      dateTo: normalizePortfolioFilterValue(value),
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
