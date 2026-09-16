import type React from 'react';
import { useMemo, useState } from 'react';

import { SisgesIcon } from '@shared/icons/sisges';

import { AnalyticsPanel } from '../shared/components';

import { APPLICATION_OPTION_IDS } from '@features/access-control/registry/applicationOptionIds';

import {
  AnalyticsScopesEmpty,
  CrmClientSelector,
  useAccesoAnalitica,
} from '../acceso';
import type {
  AnalyticsScope,
} from '../acceso';

import {
  AtencionCarteraPanel,
} from '../modules/centro-control-cartera/components/AtencionCarteraPanel';
import {
  CentroControlCarteraHeader,
} from '../modules/centro-control-cartera/components/CentroControlCarteraHeader';
import {
  DetalleCarteraTabs,
} from '../modules/centro-control-cartera/components/DetalleCarteraTabs';
import {
  EvolucionCarteraChart,
} from '../modules/centro-control-cartera/components/EvolucionCarteraChart';
import {
  FiltrosCartera,
} from '../modules/centro-control-cartera/components/FiltrosCartera';
import {
  KpiCarteraGrid,
} from '../modules/centro-control-cartera/components/KpiCarteraGrid';
import {
  EstadoRecursoCartera,
} from '../modules/centro-control-cartera/components/EstadoRecursoCartera';
import {
  MetricasSecundariasCartera,
} from '../modules/centro-control-cartera/components/MetricasSecundariasCartera';
import {
  DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
} from '../modules/centro-control-cartera/constants/centroControlCartera.constants';
import {
  useCentroControlCarteraBootstrap,
} from '../modules/centro-control-cartera/hooks/useCentroControlCarteraBootstrap';
import {
  useAutoActualizacionCartera,
} from '../modules/centro-control-cartera/hooks/useAutoActualizacionCartera';
import {
  useRendimientoCarteraController,
} from '../modules/centro-control-cartera/hooks/useRendimientoCarteraController';
import {
  switchUnidadNegocioCartera,
} from '../modules/centro-control-cartera/domain/filtroCarteraContext';
import {
  resolveCentroControlCarteraViewState,
} from '../modules/centro-control-cartera/application/portfolioView.application';
import type {
  CentroControlCarteraFilters,
} from '../modules/centro-control-cartera/domain/filtrosCartera.types';

import '../styles/32-centro-control-cartera.css';

interface CentroControlCarteraContentProps {
  scopes: readonly AnalyticsScope[];
  selectedCrmClientId: number;
  onCrmClientChange: (crmClientId: number) => void;
}

const CentroControlCarteraContent: React.FC<
  CentroControlCarteraContentProps
> = ({
  scopes,
  selectedCrmClientId,
  onCrmClientChange,
}) => {
  const [filters, setFilters] =
    useState<CentroControlCarteraFilters>(
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
  } = useCentroControlCarteraBootstrap(
    selectedCrmClientId,
    filters
  );

  const {
    effectiveBusinessUnit,
    clearBusinessUnit,
    visibleData,
    visibleIsLoading,
  } = resolveCentroControlCarteraViewState({
    filters,
    filterOptions,
    data,
    isLoading,
    error,
  });

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
    useRendimientoCarteraController({
      crmClientId: selectedCrmClientId,
      context: visibleData?.context ?? null,
      filterOptions,
    });

  useAutoActualizacionCartera({ refetch });

  const handleFiltersChange = (
    nextFilters: CentroControlCarteraFilters
  ) => {
    performanceController.resetDetailSupervisor();
    setFilters(nextFilters);
  };

  return (
    <main className="portfolio-control-center">
      <div className="portfolio-control-center__content">
        <CentroControlCarteraHeader
          freshness={visibleData?.freshness ?? null}
          isLoading={visibleIsLoading}
        />

        <div className="portfolio-control-center__sections">
          <CrmClientSelector
            scopes={scopes}
            value={selectedCrmClientId}
            onChange={onCrmClientChange}
          />

          <FiltrosCartera
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
                  ? switchUnidadNegocioCartera(
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

          <AnalyticsPanel
            variant="integrated"
            className="portfolio-control-center__section portfolio-control-center__section--kpis"
            headerClassName="portfolio-control-center__section-heading portfolio-control-center__section-heading--compact"
            iconClassName="analytics-heading-icon analytics-heading-icon--brand"
            icon={<SisgesIcon name="dashboard" />}
            title="Indicadores clave"
            description="Estado operativo principal del portafolio en el corte seleccionado."
          >
            <EstadoRecursoCartera
              isLoading={visibleIsLoading}
              error={error}
              isEmpty={visibleData === null}
              onRetry={() => {
                void refetch();
              }}
            >
              {visibleData && (
                <div className="portfolio-control-center__kpi-content">
                  <KpiCarteraGrid
                    summary={visibleData.summary}
                  />
                  <MetricasSecundariasCartera
                    summary={visibleData.summary}
                  />
                </div>
              )}
            </EstadoRecursoCartera>
          </AnalyticsPanel>

          <div className="portfolio-control-center__overview-grid">
            <EvolucionCarteraChart
              evolution={visibleData?.evolution ?? []}
              isLoading={visibleIsLoading}
              error={error}
              onRetry={() => {
                void refetch();
              }}
            />

            <AtencionCarteraPanel
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
              operationAsOfAt={
                visibleData?.freshness.operationAsOfAt ?? null
              }
              isLoading={visibleIsLoading}
              error={error}
              onRetry={() => {
                void refetch();
              }}
            />
          </div>

          <EstadoRecursoCartera
            isLoading={visibleIsLoading}
            error={error}
            isEmpty={visibleData === null}
            onRetry={() => {
              void refetch();
            }}
          >
            {visibleData && (
              <DetalleCarteraTabs
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
          </EstadoRecursoCartera>
        </div>
      </div>
    </main>
  );
};


export const CentroControlCarteraPage: React.FC = () => {
  const {
    scopes,
    loading,
    error,
    selectedCrmClientId,
    selectCrmClientId,
    refresh,
  } = useAccesoAnalitica(
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
    <CentroControlCarteraContent
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

export default CentroControlCarteraPage;
