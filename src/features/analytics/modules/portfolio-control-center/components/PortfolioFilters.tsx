import type React from 'react';
import { useEffect, useMemo } from 'react';

import {
  ActionButton,
  FeedbackMessage,
  InputField,
  SelectField,
} from '@shared/components/ui';
import { SisgesIcon } from '@shared/icons/sisges';
import type {
  PortfolioControlCenterFilterOptions,
  PortfolioControlCenterFilters,
  PortfolioFilterOption,
} from '../../../types/portfolioControlCenter.types';
import {
  getLatestPortfolioCampaign,
  getPortfolioCampaignMonthOptions,
  getPortfolioCampaignYearOptions,
  getPortfolioFilterDateBounds,
  isPortfolioBusinessUnitTransitionPending,
  keepDateWithinBounds,
  switchPortfolioBusinessUnit,
} from '../utils/portfolioFilterContext.utils';

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

const normalizeFilterValue = (
  value: string
): string | null => {
  return value === '' ? null : value;
};

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
  const effectiveCampaign = useMemo(() => {
    const selectedCampaign = filters.campaignId
      ? options.campaigns.find(
          (campaign) =>
            campaign.id === filters.campaignId &&
            (!filters.subPortfolioId ||
              options.availability.subPortfolioCampaigns.some(
                (item) =>
                  item.subPortfolioId ===
                    filters.subPortfolioId &&
                  item.campaignId === campaign.id
              ))
        ) ?? null
      : null;

    if (selectedCampaign) {
      return selectedCampaign;
    }

    if (!resolvedCampaignId) {
      return null;
    }

    return (
      options.campaigns.find(
        (campaign) =>
          campaign.id === resolvedCampaignId &&
          (!filters.subPortfolioId ||
            options.availability.subPortfolioCampaigns.some(
              (item) =>
                item.subPortfolioId ===
                  filters.subPortfolioId &&
                item.campaignId === campaign.id
            ))
      ) ?? null
    );
  }, [
    filters.campaignId,
    filters.subPortfolioId,
    options,
    resolvedCampaignId,
  ]);

  const campaignYearOptions = useMemo(
    () =>
      getPortfolioCampaignYearOptions(
        options,
        filters.subPortfolioId
      ),
    [filters.subPortfolioId, options]
  );

  const latestAvailableCampaign = useMemo(
    () =>
      filters.campaignId === null &&
      resolvedCampaignId === null
        ? getLatestPortfolioCampaign(
            options,
            filters.subPortfolioId
          )
        : null,
    [
      filters.campaignId,
      filters.subPortfolioId,
      options,
      resolvedCampaignId,
    ]
  );

  const displayedCampaign =
    effectiveCampaign ?? latestAvailableCampaign;
  const isAutomaticCampaignSelectionPending =
    effectiveCampaign === null &&
    latestAvailableCampaign !== null;

  const selectedCampaignYear =
    displayedCampaign?.year ??
    (campaignYearOptions[0]
      ? Number(campaignYearOptions[0].id)
      : null);

  const campaignMonthOptions = useMemo(
    () =>
      getPortfolioCampaignMonthOptions(
        options,
        selectedCampaignYear,
        filters.subPortfolioId
      ),
    [
      filters.subPortfolioId,
      options,
      selectedCampaignYear,
    ]
  );

  const subPortfolioOptions = useMemo(
    () =>
      options.subPortfolios
        .filter((subPortfolio) => {
          if (!filters.campaignId) {
            return true;
          }

          return options.availability.subPortfolioCampaigns.some(
            (item) =>
              item.subPortfolioId === subPortfolio.id &&
              item.campaignId === filters.campaignId
          );
        })
        .map((item) => ({
          id: item.id,
          label: item.label,
        })),
    [
      filters.campaignId,
      options.availability.subPortfolioCampaigns,
      options.subPortfolios,
    ]
  );

  const portfolioOptions = useMemo(
    () => (portfolioOption ? [portfolioOption] : []),
    [portfolioOption]
  );

  const hasBusinessUnitCatalog =
    options.businessUnits.length > 0;
  const businessUnitOptions = hasBusinessUnitCatalog
    ? [...options.businessUnits]
    : portfolioOptions;
  const effectiveBusinessUnit =
    filters.businessUnit ??
    options.selectedBusinessUnit ??
    (!hasBusinessUnitCatalog
      ? portfolioOption?.id ?? null
      : null);
  const isBusinessUnitTransitionPending =
    isPortfolioBusinessUnitTransitionPending(
      filters.businessUnit,
      options.selectedBusinessUnit
    );

  useEffect(() => {
    if (
      isLoading ||
      isBusinessUnitTransitionPending ||
      latestAvailableCampaign === null
    ) {
      return;
    }

    const nextDateBounds =
      getPortfolioFilterDateBounds(
        options,
        latestAvailableCampaign.id,
        filters.subPortfolioId
      );

    onChange({
      ...filters,
      campaignId: latestAvailableCampaign.id,
      dateFrom: keepDateWithinBounds(
        filters.dateFrom,
        nextDateBounds
      ),
      dateTo: keepDateWithinBounds(
        filters.dateTo,
        nextDateBounds
      ),
      supervisorId: null,
    });
  }, [
    filters,
    isBusinessUnitTransitionPending,
    isLoading,
    latestAvailableCampaign,
    onChange,
    options,
  ]);

  const dateBounds = useMemo(
    () =>
      getPortfolioFilterDateBounds(
        options,
        filters.campaignId,
        filters.subPortfolioId
      ),
    [
      filters.campaignId,
      filters.subPortfolioId,
      options,
    ]
  );

  const updateSubPortfolio = (
    subPortfolioId: string
  ) => {
    const normalized = normalizeFilterValue(
      subPortfolioId
    );

    const campaignStillAvailable =
      !normalized ||
      !filters.campaignId ||
      options.availability.subPortfolioCampaigns.some(
        (item) =>
          item.subPortfolioId === normalized &&
          item.campaignId === filters.campaignId
      );

    const supervisorStillAvailable =
      !normalized ||
      !filters.supervisorId ||
      options.availability.supervisorContexts.some(
        (item) =>
          item.supervisorId === filters.supervisorId &&
          item.subPortfolioId === normalized &&
          (!filters.campaignId ||
            item.campaignId === filters.campaignId)
      );

    const nextCampaignId = campaignStillAvailable
      ? filters.campaignId
      : null;
    const nextDateBounds =
      getPortfolioFilterDateBounds(
        options,
        nextCampaignId,
        normalized
      );

    onChange({
      ...filters,
      dateFrom: keepDateWithinBounds(
        filters.dateFrom,
        nextDateBounds
      ),
      dateTo: keepDateWithinBounds(
        filters.dateTo,
        nextDateBounds
      ),
      subPortfolioId: normalized,
      campaignId: nextCampaignId,
      supervisorId: supervisorStillAvailable
        ? filters.supervisorId
        : null,
    });
  };

  const updateBusinessUnit = (
    businessUnit: string
  ) => {
    if (!hasBusinessUnitCatalog) {
      return;
    }

    const normalized = normalizeFilterValue(
      businessUnit.trim()
    );

    if (
      !normalized ||
      normalized === effectiveBusinessUnit
    ) {
      return;
    }

    onChange(
      switchPortfolioBusinessUnit(
        filters,
        normalized
      )
    );
  };

  const applyCampaign = (
    campaignId: string | null
  ) => {
    const supervisorStillAvailable =
      !campaignId ||
      !filters.supervisorId ||
      options.availability.supervisorContexts.some(
        (item) =>
          item.supervisorId === filters.supervisorId &&
          item.campaignId === campaignId &&
          (!filters.subPortfolioId ||
            item.subPortfolioId === filters.subPortfolioId)
      );

    const nextDateBounds =
      getPortfolioFilterDateBounds(
        options,
        campaignId,
        filters.subPortfolioId
      );

    onChange({
      ...filters,
      dateFrom: keepDateWithinBounds(
        filters.dateFrom,
        nextDateBounds
      ),
      dateTo: keepDateWithinBounds(
        filters.dateTo,
        nextDateBounds
      ),
      campaignId,
      supervisorId: supervisorStillAvailable
        ? filters.supervisorId
        : null,
    });
  };

  const updateCampaignYear = (
    campaignYear: string
  ) => {
    const normalized =
      normalizeFilterValue(campaignYear);

    if (!normalized) {
      applyCampaign(null);
      return;
    }

    const latestCampaignForYear =
      getLatestPortfolioCampaign(
        options,
        filters.subPortfolioId,
        Number(normalized)
      );

    applyCampaign(latestCampaignForYear?.id ?? null);
  };

  const updateCampaignMonth = (
    campaignId: string
  ) => {
    applyCampaign(normalizeFilterValue(campaignId));
  };

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
            onChange={updateBusinessUnit}
          />

          <SelectField
            label="Sub cartera"
            value={filters.subPortfolioId ?? ''}
            options={subPortfolioOptions}
            placeholder="Todas"
            disabled={isLoading || effectiveCampaign === null}
            onChange={updateSubPortfolio}
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
            onChange={updateCampaignYear}
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
            onChange={updateCampaignMonth}
          />

          <InputField
            label="Desde"
            type="date"
            value={filters.dateFrom ?? ''}
            min={dateBounds.min ?? undefined}
            max={
              filters.dateTo ??
              dateBounds.max ??
              undefined
            }
            disabled={isLoading || effectiveCampaign === null}
            onChange={(event) => {
              onChange({
                ...filters,
                dateFrom: normalizeFilterValue(
                  event.target.value
                ),
              });
            }}
          />

          <InputField
            label="Hasta"
            type="date"
            value={filters.dateTo ?? ''}
            min={
              filters.dateFrom ??
              dateBounds.min ??
              undefined
            }
            max={dateBounds.max ?? undefined}
            disabled={isLoading || effectiveCampaign === null}
            onChange={(event) => {
              onChange({
                ...filters,
                dateTo: normalizeFilterValue(
                  event.target.value
                ),
              });
            }}
          />

        </div>
      )}
    </section>
  );
};
