import type React from 'react';

import {
  InputField,
  SelectField,
} from '@shared/components/ui';

import type {
  FiltrosCarteraViewModel,
} from '../application/filtrosCartera.application';
import type {
  CentroControlCarteraFilters,
  FiltroCarteraOption,
} from '../domain/filtrosCartera.types';

interface FiltroCarteraFieldsProps {
  clientOptions: readonly FiltroCarteraOption[];
  selectedClientId: number;
  filters: CentroControlCarteraFilters;
  viewModel: FiltrosCarteraViewModel;
  isLoading: boolean;
  onClientChange: (clientId: number) => void;
  onBusinessUnitChange: (value: string) => void;
  onSubPortfolioChange: (value: string) => void;
  onCampaignYearChange: (value: string) => void;
  onCampaignMonthChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export const FiltroCarteraFields: React.FC<
  FiltroCarteraFieldsProps
> = ({
  clientOptions,
  selectedClientId,
  filters,
  viewModel,
  isLoading,
  onClientChange,
  onBusinessUnitChange,
  onSubPortfolioChange,
  onCampaignYearChange,
  onCampaignMonthChange,
  onDateFromChange,
  onDateToChange,
}) => {
  const {
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
    <div className="analytics-filter-surface portfolio-filter-grid portfolio-filter-grid--without-supervisor">
      <SelectField
        label="Cliente"
        value={String(selectedClientId)}
        options={[...clientOptions]}
        hidePlaceholder
        disabled={isLoading || clientOptions.length <= 1}
        onChange={(value) => {
          const clientId = Number(value);

          if (Number.isSafeInteger(clientId) && clientId > 0) {
            onClientChange(clientId);
          }
        }}
      />

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

      <SelectField
        label="Sub cartera"
        value={filters.subPortfolioId ?? ''}
        options={subPortfolioOptions}
        placeholder="Todas"
        disabled={isLoading || displayedCampaign === null}
        onChange={onSubPortfolioChange}
      />

      <InputField
        label="Desde"
        type="date"
        value={filters.dateFrom ?? ''}
        min={dateBounds.min ?? undefined}
        max={filters.dateTo ?? dateBounds.max ?? undefined}
        disabled={isLoading || displayedCampaign === null}
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
        disabled={isLoading || displayedCampaign === null}
        onChange={(event) => {
          onDateToChange(event.target.value);
        }}
      />
    </div>
  );
};

export default FiltroCarteraFields;
