import type React from 'react';
import { useMemo } from 'react';

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
  getPortfolioFilterDateBounds,
  keepDateWithinBounds,
} from '../utils/portfolioFilterContext.utils';

interface PortfolioFiltersProps {
  filters: PortfolioControlCenterFilters;
  options: PortfolioControlCenterFilterOptions;
  portfolioOption: PortfolioFilterOption | null;
  isLoading: boolean;
  error: string | null;
  useLatestCampaignFallback?: boolean;
  restrictSupervisorFilter?: boolean;
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
  isLoading,
  error,
  useLatestCampaignFallback = false,
  restrictSupervisorFilter = false,
  onChange,
  onClear,
  onRetry,
}) => {
  const campaignOptions = useMemo(
    () =>
      options.campaigns
        .filter((campaign) => {
          if (!filters.subPortfolioId) {
            return true;
          }

          return options.availability.subPortfolioCampaigns.some(
            (item) =>
              item.subPortfolioId === filters.subPortfolioId &&
              item.campaignId === campaign.id
          );
        })
        .map((item) => ({
          id: item.id,
          label: item.label,
        })),
    [
      filters.subPortfolioId,
      options.availability.subPortfolioCampaigns,
      options.campaigns,
    ]
  );

  const supervisorOptions = useMemo(
    () =>
      options.supervisors
        .filter((supervisor) =>
          options.availability.supervisorContexts.some(
            (item) => {
              if (item.supervisorId !== supervisor.id) {
                return false;
              }

              if (
                filters.subPortfolioId &&
                item.subPortfolioId !== filters.subPortfolioId
              ) {
                return false;
              }

              if (
                filters.campaignId &&
                item.campaignId !== filters.campaignId
              ) {
                return false;
              }

              return true;
            }
          )
        )
        .map((item) => ({
          id: item.id,
          label: item.label,
        })),
    [
      filters.campaignId,
      filters.subPortfolioId,
      options.availability.supervisorContexts,
      options.supervisors,
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

  const dateBounds = useMemo(
    () =>
      getPortfolioFilterDateBounds(
        options,
        filters.campaignId,
        useLatestCampaignFallback,
        filters.subPortfolioId
      ),
    [
      filters.campaignId,
      filters.subPortfolioId,
      options,
      useLatestCampaignFallback,
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
        useLatestCampaignFallback,
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

  const updateCampaign = (
    campaignId: string
  ) => {
    const normalized = normalizeFilterValue(
      campaignId
    );

    const supervisorStillAvailable =
      !normalized ||
      !filters.supervisorId ||
      options.availability.supervisorContexts.some(
        (item) =>
          item.supervisorId === filters.supervisorId &&
          item.campaignId === normalized &&
          (!filters.subPortfolioId ||
            item.subPortfolioId === filters.subPortfolioId)
      );

    const nextDateBounds =
      getPortfolioFilterDateBounds(
        options,
        normalized,
        useLatestCampaignFallback,
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
      campaignId: normalized,
      supervisorId: supervisorStillAvailable
        ? filters.supervisorId
        : null,
    });
  };

  const updateSupervisor = (
    supervisorId: string
  ) => {
    onChange({
      ...filters,
      supervisorId: normalizeFilterValue(
        supervisorId
      ),
    });
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
        <div
          className={[
            'portfolio-filter-grid',
            restrictSupervisorFilter
              ? 'portfolio-filter-grid--without-supervisor'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
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
            disabled={isLoading}
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
            disabled={isLoading}
            onChange={(event) => {
              onChange({
                ...filters,
                dateTo: normalizeFilterValue(
                  event.target.value
                ),
              });
            }}
          />

          <SelectField
            label="Cartera"
            value={portfolioOption?.id ?? ''}
            options={portfolioOptions}
            placeholder="No disponible"
            disabled={isLoading || !portfolioOption}
            onChange={() => undefined}
          />

          <SelectField
            label="Sub cartera"
            value={filters.subPortfolioId ?? ''}
            options={subPortfolioOptions}
            placeholder="Todas"
            disabled={isLoading}
            onChange={updateSubPortfolio}
          />

          <SelectField
            label="Campaña"
            value={filters.campaignId ?? ''}
            options={campaignOptions}
            placeholder={
              useLatestCampaignFallback
                ? 'Última disponible'
                : 'Todas'
            }
            disabled={isLoading}
            onChange={updateCampaign}
          />

          {!restrictSupervisorFilter && (
            <SelectField
              label="Supervisor"
              value={filters.supervisorId ?? ''}
              options={supervisorOptions}
              placeholder="Todos"
              disabled={isLoading}
              onChange={updateSupervisor}
            />
          )}
        </div>
      )}
    </section>
  );
};
