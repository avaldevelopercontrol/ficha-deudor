import type React from 'react';

import {
  InputField,
  SelectField,
} from '@shared/components/ui';

import type {
  PortfolioFiltersViewModel,
} from '../application/portfolioFilters.application';
import type {
  PortfolioControlCenterFilters,
} from '../domain/portfolioFilters.types';

interface PortfolioFilterFieldsProps {
  filters: PortfolioControlCenterFilters;
  viewModel: PortfolioFiltersViewModel;
  isLoading: boolean;
  onBusinessUnitChange: (value: string) => void;
  onSubPortfolioChange: (value: string) => void;
  onCampaignYearChange: (value: string) => void;
  onCampaignMonthChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export const PortfolioFilterFields: React.FC<
  PortfolioFilterFieldsProps
> = ({
  filters,
  viewModel,
  isLoading,
  onBusinessUnitChange,
  onSubPortfolioChange,
  onCampaignYearChange,
  onCampaignMonthChange,
  onDateFromChange,
  onDateToChange,
}) => {
  const {
    effectiveCampaign,
    displayedCampaign,
    isAutomaticCampaignSelectionPending,
    campaignYearOptions,
    selectedCampaignYear,
    campaignMonthOptions,
    subPortfolioOptions,
    businessUnitOptions,
    effectiveBusinessUnit,
    isBusinessUnitTransitionPending,
    dateBounds,
  } = viewModel;

  return (
    <div className="portfolio-filter-grid portfolio-filter-grid--without-supervisor">
      <SelectField
        label="Cartera"
        value={effectiveBusinessUnit ?? ''}
        options={businessUnitOptions}
        hidePlaceholder
        disabled={
          isLoading ||
          isBusinessUnitTransitionPending ||
          businessUnitOptions.length <= 1
        }
        onChange={onBusinessUnitChange}
      />

      <SelectField
        label="Sub cartera"
        value={filters.subPortfolioId ?? ''}
        options={subPortfolioOptions}
        placeholder="Todas"
        disabled={isLoading || effectiveCampaign === null}
        onChange={onSubPortfolioChange}
      />

      <SelectField
        label="Año"
        value={
          selectedCampaignYear !== null
            ? String(selectedCampaignYear)
            : ''
        }
        options={campaignYearOptions}
        placeholder="Selecciona año"
        hidePlaceholder={selectedCampaignYear !== null}
        disabled={
          isLoading ||
          isAutomaticCampaignSelectionPending ||
          campaignYearOptions.length === 0
        }
        onChange={onCampaignYearChange}
      />

      <SelectField
        label="Mes"
        value={displayedCampaign?.id ?? ''}
        options={campaignMonthOptions}
        placeholder={
          selectedCampaignYear === null
            ? 'Selecciona año'
            : displayedCampaign === null
              ? 'Selecciona mes'
              : 'Todos'
        }
        hidePlaceholder={displayedCampaign !== null}
        disabled={
          isLoading ||
          isAutomaticCampaignSelectionPending ||
          selectedCampaignYear === null
        }
        onChange={onCampaignMonthChange}
      />

      <InputField
        label="Desde"
        type="date"
        value={filters.dateFrom ?? ''}
        min={dateBounds.min ?? undefined}
        max={filters.dateTo ?? dateBounds.max ?? undefined}
        disabled={isLoading || effectiveCampaign === null}
        onChange={(event) => {
          onDateFromChange(event.target.value);
        }}
      />

      <InputField
        label="Hasta"
        type="date"
        value={filters.dateTo ?? ''}
        min={filters.dateFrom ?? dateBounds.min ?? undefined}
        max={dateBounds.max ?? undefined}
        disabled={isLoading || effectiveCampaign === null}
        onChange={(event) => {
          onDateToChange(event.target.value);
        }}
      />
    </div>
  );
};

export default PortfolioFilterFields;
