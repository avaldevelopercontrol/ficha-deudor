import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { SisgesIcon } from '@shared/icons/sisges';

import { env } from '@app/config/env';

import {
  AnalyticsScopesEmpty,
  CrmClientSelector,
  useAnalyticsAccess,
} from '../access';
import type {
  AnalyticsScope,
} from '../access';

import {
  PortfolioAttentionPanel,
} from '../modules/portfolio-control-center/components/PortfolioAttentionPanel';
import {
  PortfolioControlCenterHeader,
} from '../modules/portfolio-control-center/components/PortfolioControlCenterHeader';
import {
  PortfolioDetailTabs,
} from '../modules/portfolio-control-center/components/PortfolioDetailTabs';
import {
  PortfolioEvolutionChart,
} from '../modules/portfolio-control-center/components/PortfolioEvolutionChart';
import {
  PortfolioFilters,
} from '../modules/portfolio-control-center/components/PortfolioFilters';
import {
  PortfolioKpiGrid,
} from '../modules/portfolio-control-center/components/PortfolioKpiGrid';
import {
  PortfolioResourceState,
} from '../modules/portfolio-control-center/components/PortfolioResourceState';
import {
  PortfolioSecondaryMetrics,
} from '../modules/portfolio-control-center/components/PortfolioSecondaryMetrics';
import {
  DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
} from '../modules/portfolio-control-center/constants/portfolioControlCenter.constants';
import {
  usePortfolioControlCenter,
} from '../modules/portfolio-control-center/hooks/usePortfolioControlCenter';
import {
  usePortfolioControlCenterFilterOptions,
} from '../modules/portfolio-control-center/hooks/usePortfolioControlCenterFilterOptions';
import {
  usePortfolioPerformanceDetail,
} from '../modules/portfolio-control-center/hooks/usePortfolioPerformanceDetail';
import {
  getPortfolioSupervisorOptionsForContext,
  PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID,
} from '../modules/portfolio-control-center/utils/portfolioFilterContext.utils';
import type {
  PortfolioControlCenterFilters,
} from '../types/portfolioControlCenter.types';

import '../styles/32-portfolio-control-center.css';

const PORTFOLIO_AUTO_REFRESH_MS = 5 * 60 * 1000;

interface PortfolioControlCenterContentProps {
  scopes: readonly AnalyticsScope[];
  selectedCrmClientId: number;
  onCrmClientChange: (crmClientId: number) => void;
}

const PortfolioControlCenterContent: React.FC<
  PortfolioControlCenterContentProps
> = ({
  scopes,
  selectedCrmClientId,
  onCrmClientChange,
}) => {
  const useLatestCampaignFallback =
    !env.analyticsUseMocks;
  const restrictSupervisorFilter =
    !env.analyticsUseMocks;

  const [filters, setFilters] =
    useState<PortfolioControlCenterFilters>(
      DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS
    );

  const [detailSupervisorId, setDetailSupervisorId] =
    useState<string | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = usePortfolioControlCenter(filters);

  const {
    data: filterOptions,
    isLoading: areFiltersLoading,
    error: filterOptionsError,
    refetch: refetchFilterOptions,
  } = usePortfolioControlCenterFilterOptions();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refetch();
      }
    }, PORTFOLIO_AUTO_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refetch]);

  const portfolioOption = useMemo(() => {
    const scope = filterOptions.portfolio;

    if (!scope) {
      return null;
    }

    const selectedScope = scopes.find(
      (item) =>
        item.crmClientId ===
        selectedCrmClientId
    );

    return {
      id: scope.id,
      label:
        selectedScope?.name ||
        `Cartera ${scope.id}`,
    };
  }, [
    filterOptions.portfolio,
    scopes,
    selectedCrmClientId,
  ]);

  const hasUnassignedAdvisors = Boolean(
    data?.advisors.some(
      (item) => item.currentSupervisorId === null
    )
  );

  const contextualSupervisorOptions = useMemo(
    () =>
      getPortfolioSupervisorOptionsForContext(
        filterOptions,
        data?.context.campaignId ?? null,
        data?.context.subPortfolioId ?? null,
        hasUnassignedAdvisors
      ),
    [
      data?.context.campaignId,
      data?.context.subPortfolioId,
      filterOptions,
      hasUnassignedAdvisors,
    ]
  );

  const isUnassignedSupervisorSelected = Boolean(
    detailSupervisorId ===
      PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID &&
      hasUnassignedAdvisors
  );

  const effectiveDetailSupervisorId =
    detailSupervisorId &&
    !isUnassignedSupervisorSelected &&
    contextualSupervisorOptions.some(
      (item) => item.id === detailSupervisorId
    )
      ? detailSupervisorId
      : null;

  const detailSupervisorFilterValue =
    isUnassignedSupervisorSelected
      ? PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID
      : effectiveDetailSupervisorId;

  const {
    data: filteredDetail,
    isLoading: isDetailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = usePortfolioPerformanceDetail({
    context: data?.context ?? null,
    supervisorId: effectiveDetailSupervisorId,
    enabled: !env.analyticsUseMocks,
  });

  const hasContextualSupervisor = Boolean(
    !env.analyticsUseMocks &&
      effectiveDetailSupervisorId
  );
  const detailSupervisors = isUnassignedSupervisorSelected
    ? []
    : hasContextualSupervisor
      ? filteredDetail?.supervisors ?? []
      : data?.supervisors ?? [];
  const detailAdvisors = isUnassignedSupervisorSelected
    ? data?.advisors.filter(
        (item) => item.currentSupervisorId === null
      ) ?? []
    : hasContextualSupervisor
      ? filteredDetail?.advisors ?? []
      : data?.advisors ?? [];

  const handleFiltersChange = (
    nextFilters: PortfolioControlCenterFilters
  ) => {
    setDetailSupervisorId(null);
    setFilters(nextFilters);
  };

  return (
    <main className="portfolio-control-center">
      <div className="portfolio-control-center__content">
        <PortfolioControlCenterHeader
          freshness={data?.freshness ?? null}
          isLoading={isLoading}
        />

        <div className="portfolio-control-center__sections">
          <CrmClientSelector
            scopes={scopes}
            value={selectedCrmClientId}
            onChange={onCrmClientChange}
          />

          <PortfolioFilters
            filters={filters}
            options={filterOptions}
            portfolioOption={portfolioOption}
            isLoading={areFiltersLoading}
            error={filterOptionsError}
            useLatestCampaignFallback={
              useLatestCampaignFallback
            }
            restrictSupervisorFilter={
              restrictSupervisorFilter
            }
            onChange={handleFiltersChange}
            onClear={() => {
              setDetailSupervisorId(null);
              setFilters(
                DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS
              );
            }}
            onRetry={() => {
              void refetchFilterOptions();
            }}
          />

          <section className="portfolio-control-center__section portfolio-control-center__section--kpis">
            <div className="portfolio-control-center__section-heading portfolio-control-center__section-heading--compact">
              <h2>
                <span
                  className="portfolio-heading-icon portfolio-heading-icon--kpi"
                  aria-hidden="true"
                >
                  <SisgesIcon name="dashboard" />
                </span>
                Indicadores clave
              </h2>
              <p>
                Estado operativo principal del portafolio en el corte seleccionado.
              </p>
            </div>

            <PortfolioResourceState
              isLoading={isLoading}
              error={error}
              isEmpty={data === null}
              onRetry={() => {
                void refetch();
              }}
            >
              {data && (
                <div className="portfolio-control-center__kpi-content">
                  <PortfolioKpiGrid
                    summary={data.summary}
                  />
                  <PortfolioSecondaryMetrics
                    summary={data.summary}
                  />
                </div>
              )}
            </PortfolioResourceState>
          </section>

          <div className="portfolio-control-center__overview-grid">
            <PortfolioEvolutionChart
              evolution={data?.evolution ?? []}
              isLoading={isLoading}
              error={error}
              onRetry={() => {
                void refetch();
              }}
            />

            <PortfolioAttentionPanel
              items={data?.attention ?? []}
              target={data?.target ?? null}
              recoveredAmount={
                data?.summary.recoveredAmount ?? null
              }
              context={
                data
                  ? {
                      campaignId: data.context.campaignId,
                      subPortfolioId: data.context.subPortfolioId,
                    }
                  : null
              }
            />
          </div>

          <PortfolioResourceState
            isLoading={isLoading}
            error={error}
            isEmpty={data === null}
            onRetry={() => {
              void refetch();
            }}
          >
            {data && (
              <PortfolioDetailTabs
                campaigns={data.campaigns}
                supervisors={detailSupervisors}
                advisors={detailAdvisors}
                contextualSupervisorFilter={{
                  enabled: !env.analyticsUseMocks,
                  value: detailSupervisorFilterValue,
                  options: contextualSupervisorOptions,
                  isLoading:
                    !isUnassignedSupervisorSelected &&
                    isDetailLoading,
                  error: isUnassignedSupervisorSelected
                    ? null
                    : detailError,
                  onChange: setDetailSupervisorId,
                  onRetry: () => {
                    void refetchDetail();
                  },
                }}
              />
            )}
          </PortfolioResourceState>
        </div>
      </div>
    </main>
  );
};

const PORTFOLIO_CONTROL_CENTER_OPTION_ID = 23;

export const PortfolioControlCenterPage: React.FC = () => {
  const {
    scopes,
    loading,
    error,
    selectedCrmClientId,
    selectCrmClientId,
    refresh,
  } = useAnalyticsAccess(
    PORTFOLIO_CONTROL_CENTER_OPTION_ID
  );

  if (loading) {
    return (
      <main className="portfolio-control-center">
        <div className="portfolio-control-center__content">
          <section className="portfolio-control-center__section">
            Cargando carteras autorizadas...
          </section>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="portfolio-control-center">
        <div className="portfolio-control-center__content">
          <section className="portfolio-control-center__section">
            <p>
              No se pudieron cargar las carteras autorizadas.
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                void refresh();
              }}
            >
              Reintentar
            </button>
          </section>
        </div>
      </main>
    );
  }

  if (
    scopes.length === 0 ||
    selectedCrmClientId === null
  ) {
    return <AnalyticsScopesEmpty />;
  }

  return (
    <PortfolioControlCenterContent
      key={selectedCrmClientId}
      scopes={scopes}
      selectedCrmClientId={
        selectedCrmClientId
      }
      onCrmClientChange={
        selectCrmClientId
      }
    />
  );
};

export default PortfolioControlCenterPage;
