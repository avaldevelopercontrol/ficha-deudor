import type React from 'react';

import {
  ActionButton,
  FeedbackMessage,
} from '@shared/components/ui';
import { SisgesIcon } from '@shared/icons/sisges';

import type {
  PortfolioControlCenterFilterOptions,
  PortfolioControlCenterFilters,
  PortfolioFilterOption,
} from '../domain/portfolioFilters.types';
import { usePortfolioFiltersController } from '../hooks/usePortfolioFiltersController';
import { PortfolioFilterFields } from './PortfolioFilterFields';

interface PortfolioFiltersProps {
  filters: PortfolioControlCenterFilters;
  options: PortfolioControlCenterFilterOptions;
  portfolioOption: PortfolioFilterOption | null;
  resolvedCampaignId: string | null;
  isLoading: boolean;
  error: string | null;
  onChange: (
    filters: PortfolioControlCenterFilters
  ) => void;
  onClear: () => void;
  onRetry: () => void;
}

export const PortfolioFilters: React.FC<
  PortfolioFiltersProps
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
  } = usePortfolioFiltersController({
    filters,
    options,
    portfolioOption,
    resolvedCampaignId,
    isLoading,
    onChange,
  });

  return (
    <section className="portfolio-control-center__section portfolio-control-center__section--filters">
      <div className="portfolio-control-center__filter-heading">
        <div>
          <h2>
            <span
              className="portfolio-heading-icon"
              aria-hidden="true"
            >
              <SisgesIcon name="filter" />
            </span>
            Filtros operativos
          </h2>
        </div>

        <ActionButton
          label="Limpiar"
          variant="secondary"
          size="sm"
          disabled={isLoading}
          onClick={onClear}
        />
      </div>

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
        <PortfolioFilterFields
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
    </section>
  );
};
