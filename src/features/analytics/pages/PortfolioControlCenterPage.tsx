import type React from 'react';
import { useMemo, useState } from 'react';

import { SisgesIcon } from '@shared/icons/sisges';

import { APPLICATION_OPTION_IDS } from '@features/access-control/registry/applicationOptionIds';

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
  usePortfolioControlCenterBootstrap,
} from '../modules/portfolio-control-center/hooks/usePortfolioControlCenterBootstrap';
import {
  usePortfolioAutoRefresh,
} from '../modules/portfolio-control-center/hooks/usePortfolioAutoRefresh';
import {
  usePortfolioPerformanceController,
} from '../modules/portfolio-control-center/hooks/usePortfolioPerformanceController';
import {
  isPortfolioBusinessUnitTransitionPending,
  switchPortfolioBusinessUnit,
} from '../modules/portfolio-control-center/utils/portfolioFilterContext.utils';
import type {
  PortfolioControlCenterFilters,
} from '../types/portfolioControlCenter.types';

import '../styles/32-portfolio-control-center.css';

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
  const [filters, setFilters] =
    useState<PortfolioControlCenterFilters>(
      DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS
    );

  const {
    data,
    isLoading,
    error,
    refetch,
    filterOptions,
    areFiltersLoading,
    filterOptionsError,
    refetchFilterOptions,
  } = usePortfolioControlCenterBootstrap(
    selectedCrmClientId,
    filters
  );

  const effectiveBusinessUnit =
    filters.businessUnit ??
    filterOptions.selectedBusinessUnit;
  const clearBusinessUnit =
    filterOptions.selectedBusinessUnit ??
    filters.businessUnit;
  const confirmedBusinessUnit =
    data?.context.businessUnit ??
    filterOptions.selectedBusinessUnit;
  const isBusinessUnitTransitionPending =
    isPortfolioBusinessUnitTransitionPending(
      filters.businessUnit,
      confirmedBusinessUnit
    );
  const visibleData = isBusinessUnitTransitionPending
    ? null
    : data;
  const visibleIsLoading =
    isLoading ||
    (isBusinessUnitTransitionPending && !error);

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

  const performanceController =
    usePortfolioPerformanceController({
      crmClientId: selectedCrmClientId,
      context: visibleData?.context ?? null,
      filterOptions,
    });

  usePortfolioAutoRefresh({ refetch });

  const handleFiltersChange = (
    nextFilters: PortfolioControlCenterFilters
  ) => {
    performanceController.resetDetailSupervisor();
    setFilters(nextFilters);
  };

  return (
    <main className="portfolio-control-center">
      <div className="portfolio-control-center__content">
        <PortfolioControlCenterHeader
          freshness={visibleData?.freshness ?? null}
          isLoading={visibleIsLoading}
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
            resolvedCampaignId={
              visibleData?.context.campaignId ?? null
            }
            isLoading={areFiltersLoading}
            error={filterOptionsError}
            onChange={handleFiltersChange}
            onClear={() => {
              performanceController.resetDetailSupervisor();
              setFilters((currentFilters) =>
                clearBusinessUnit
                  ? switchPortfolioBusinessUnit(
                      currentFilters,
                      clearBusinessUnit
                    )
                  : DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS
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
              isLoading={visibleIsLoading}
              error={error}
              isEmpty={visibleData === null}
              onRetry={() => {
                void refetch();
              }}
            >
              {visibleData && (
                <div className="portfolio-control-center__kpi-content">
                  <PortfolioKpiGrid
                    summary={visibleData.summary}
                  />
                  <PortfolioSecondaryMetrics
                    summary={visibleData.summary}
                  />
                </div>
              )}
            </PortfolioResourceState>
          </section>

          <div className="portfolio-control-center__overview-grid">
            <PortfolioEvolutionChart
              evolution={visibleData?.evolution ?? []}
              isLoading={visibleIsLoading}
              error={error}
              onRetry={() => {
                void refetch();
              }}
            />

            <PortfolioAttentionPanel
              key={effectiveBusinessUnit ?? 'legacy'}
              items={visibleData?.attention ?? []}
              target={visibleData?.target ?? null}
              recoveredAmount={
                visibleData?.summary.recoveredAmount ?? null
              }
              context={
                visibleData
                  ? {
                      crmClientId: selectedCrmClientId,
                      businessUnit:
                        visibleData.context.businessUnit,
                      campaignId:
                        visibleData.context.campaignId,
                      subPortfolioId:
                        visibleData.context.subPortfolioId,
                    }
                  : null
              }
              isLoading={visibleIsLoading}
              error={error}
              onRetry={() => {
                void refetch();
              }}
            />
          </div>

          <PortfolioResourceState
            isLoading={visibleIsLoading}
            error={error}
            isEmpty={visibleData === null}
            onRetry={() => {
              void refetch();
            }}
          >
            {visibleData && (
              <PortfolioDetailTabs
                campaigns={visibleData.campaigns}
                supervisors={performanceController.supervisors}
                advisors={performanceController.advisors}
                onActiveTabChange={
                  performanceController.onActiveTabChange
                }
                contextualSupervisorFilter={{
                  enabled: true,
                  ...performanceController.supervisorFilter,
                }}
              />
            )}
          </PortfolioResourceState>
        </div>
      </div>
    </main>
  );
};


export const PortfolioControlCenterPage: React.FC = () => {
  const {
    scopes,
    loading,
    error,
    selectedCrmClientId,
    selectCrmClientId,
    refresh,
  } = useAnalyticsAccess(
    APPLICATION_OPTION_IDS.PORTFOLIO_CONTROL_CENTER
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
