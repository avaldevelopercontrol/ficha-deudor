import type React from 'react';

import {
  ActionButton,
  FeedbackMessage,
} from '@shared/components/ui';

import { AnalyticsFilterPanel } from '../../../shared/components';

import type {
  CentroControlCarteraFilterOptions,
  CentroControlCarteraFilters,
  FiltroCarteraOption,
} from '../domain/filtrosCartera.types';
import { useFiltrosCarteraController } from '../hooks/useFiltrosCarteraController';
import { FiltroCarteraFields } from './FiltroCarteraFields';

interface FiltrosCarteraProps {
  filters: CentroControlCarteraFilters;
  options: CentroControlCarteraFilterOptions;
  portfolioOption: FiltroCarteraOption | null;
  resolvedCampaignId: string | null;
  isLoading: boolean;
  error: string | null;
  onChange: (
    filters: CentroControlCarteraFilters
  ) => void;
  onClear: () => void;
  onRetry: () => void;
}

export const FiltrosCartera: React.FC<
  FiltrosCarteraProps
> = ({
  filters,
  options,
  portfolioOption,
  resolvedCampaignId,
  isLoading,
  error,
  onChange,
  onClear,
  onRetry,
}) => {
  const {
    viewModel,
    updateSubPortfolio,
    updateBusinessUnit,
    updateCampaignYear,
    updateCampaignMonth,
    updateDateFrom,
    updateDateTo,
  } = useFiltrosCarteraController({
    filters,
    options,
    portfolioOption,
    resolvedCampaignId,
    isLoading,
    onChange,
  });

  return (
    <AnalyticsFilterPanel
      title="Filtros operativos"
      disabled={isLoading}
      onClear={onClear}
    >
      {error ? (
        <div className="portfolio-control-center__filter-error">
          <FeedbackMessage
            variant="error"
            title="No se pudieron cargar los filtros"
            message={error}
          />
          <ActionButton
            label="Reintentar"
            variant="secondary"
            size="sm"
            onClick={onRetry}
          />
        </div>
      ) : (
        <FiltroCarteraFields
          filters={filters}
          viewModel={viewModel}
          isLoading={isLoading}
          onBusinessUnitChange={updateBusinessUnit}
          onSubPortfolioChange={updateSubPortfolio}
          onCampaignYearChange={updateCampaignYear}
          onCampaignMonthChange={updateCampaignMonth}
          onDateFromChange={updateDateFrom}
          onDateToChange={updateDateTo}
        />
      )}
    </AnalyticsFilterPanel>
  );
};
