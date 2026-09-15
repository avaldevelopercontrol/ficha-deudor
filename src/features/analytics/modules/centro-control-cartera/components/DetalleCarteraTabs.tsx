import type React from 'react';
import { useMemo, useState } from 'react';

import {
  SelectField,
} from '@shared/components/ui';
import { SisgesIcon } from '@shared/icons/sisges';

import { AnalyticsPanel } from '../../../shared/components';
import type {
  AdvisorPerformanceItem,
  RendimientoCampanaItem,
  DetalleCarteraTab,
  SupervisorPerformanceItem,
} from '../domain/panoramaCartera.types';
import type {
  PortfolioSupervisorFilterOption,
} from '../domain/filtrosCartera.types';
import {
  PORTFOLIO_DETAIL_SORT_OPTIONS,
  sortAdvisorPerformanceByHighest,
  sortRendimientoCampanaByHighest,
  sortSupervisorPerformanceByHighest,
} from '../utils/detalleCarteraSort.utils';
import {
  PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID,
} from '../domain/filtroCarteraContext';
import {
  AdvisorPerformanceTable,
} from './AdvisorPerformanceTable';
import {
  RendimientoCampanaTable,
} from './RendimientoCampanaTable';
import {
  EstadoRecursoCartera,
} from './EstadoRecursoCartera';
import {
  SupervisorPerformanceTable,
} from './SupervisorPerformanceTable';

interface DetalleCarteraTabsProps {
  campaigns: readonly RendimientoCampanaItem[];
  supervisors: readonly SupervisorPerformanceItem[];
  advisors: readonly AdvisorPerformanceItem[];
  onActiveTabChange?: (tab: DetalleCarteraTab) => void;
  contextualSupervisorFilter?: {
    enabled: boolean;
    value: string | null;
    options: readonly PortfolioSupervisorFilterOption[];
    isLoading: boolean;
    error: string | null;
    onChange: (supervisorId: string | null) => void;
    onRetry: () => void;
  };
}

interface DetalleCarteraSortState {
  campaigns: string;
  supervisors: string;
  advisors: string;
}

const EMPTY_SORT_STATE: DetalleCarteraSortState = {
  campaigns: '',
  supervisors: '',
  advisors: '',
};

export const DetalleCarteraTabs: React.FC<
  DetalleCarteraTabsProps
> = ({
  campaigns,
  supervisors,
  advisors,
  onActiveTabChange,
  contextualSupervisorFilter,
}) => {
  const [activeTab, setActiveTab] =
    useState<DetalleCarteraTab>('campaigns');
  const [sortByTab, setSortByTab] =
    useState<DetalleCarteraSortState>(EMPTY_SORT_STATE);

  const showContextualSupervisorFilter = Boolean(
    contextualSupervisorFilter?.enabled &&
      activeTab !== 'campaigns'
  );
  const activeSortOptions = useMemo(
    () =>
      PORTFOLIO_DETAIL_SORT_OPTIONS[activeTab].map((option) => ({
        id: option.id,
        label: option.label,
      })),
    [activeTab]
  );

  const contextualSupervisorOptions = useMemo(() => {
    const options = contextualSupervisorFilter?.options ?? [];

    if (activeTab === 'advisors') {
      return options;
    }

    return options.filter(
      (option) =>
        option.id !==
        PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID
    );
  }, [activeTab, contextualSupervisorFilter?.options]);

  const sortedCampaigns = useMemo(
    () =>
      sortRendimientoCampanaByHighest(
        campaigns,
        sortByTab.campaigns
      ),
    [campaigns, sortByTab.campaigns]
  );

  const sortedSupervisors = useMemo(
    () =>
      sortSupervisorPerformanceByHighest(
        supervisors,
        sortByTab.supervisors
      ),
    [supervisors, sortByTab.supervisors]
  );

  const sortedAdvisors = useMemo(
    () =>
      sortAdvisorPerformanceByHighest(
        advisors,
        sortByTab.advisors
      ),
    [advisors, sortByTab.advisors]
  );

  const changeActiveTab = (tab: DetalleCarteraTab) => {
    setActiveTab(tab);
    onActiveTabChange?.(tab);
  };

  const renderSupervisorOrAdvisorPanel = () => {
    if (contextualSupervisorFilter?.enabled) {
      return (
        <EstadoRecursoCartera
          isLoading={contextualSupervisorFilter.isLoading}
          error={contextualSupervisorFilter.error}
          isEmpty={false}
          onRetry={contextualSupervisorFilter.onRetry}
        >
          {activeTab === 'supervisors' ? (
            <SupervisorPerformanceTable
              items={sortedSupervisors}
            />
          ) : (
            <AdvisorPerformanceTable items={sortedAdvisors} />
          )}
        </EstadoRecursoCartera>
      );
    }

    return activeTab === 'supervisors' ? (
      <SupervisorPerformanceTable items={sortedSupervisors} />
    ) : (
      <AdvisorPerformanceTable items={sortedAdvisors} />
    );
  };

  return (
    <AnalyticsPanel
      variant="integrated"
      className="analytics-data-panel portfolio-control-center__section--detail"
      headerClassName="analytics-data-panel__header portfolio-control-center__detail-header"
      iconClassName="analytics-heading-icon"
      icon={<SisgesIcon name="bar-chart" />}
      title="Detalle operativo"
      description="Compara campañas, equipos y asesores sin abandonar el Control Center."
      actions={(
        <div className="portfolio-control-center__detail-actions">
          <div className="portfolio-control-center__detail-sort-filter">
            <SelectField<string>
              label="Ordenar por mayor"
              layout="inline"
              value={sortByTab[activeTab]}
              options={activeSortOptions}
              placeholder="Sin ordenar"
              onChange={(value) => {
                setSortByTab((current) => ({
                  ...current,
                  [activeTab]: value,
                }));
              }}
            />
          </div>

          {showContextualSupervisorFilter &&
            contextualSupervisorFilter && (
              <div className="portfolio-control-center__detail-supervisor-filter">
                <SelectField
                  label="Supervisor del período"
                  layout="inline"
                  value={
                    contextualSupervisorFilter.value ?? ''
                  }
                  options={[...contextualSupervisorOptions]}
                  placeholder="Todos"
                  disabled={
                    contextualSupervisorFilter.isLoading
                  }
                  onChange={(value) => {
                    contextualSupervisorFilter.onChange(
                      value === '' ? null : value
                    );
                  }}
                />
              </div>
            )}

          <div
            className="portfolio-detail-tabs"
            role="tablist"
            aria-label="Detalle operativo"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'campaigns'}
              className={`portfolio-detail-tab ${
                activeTab === 'campaigns'
                  ? 'portfolio-detail-tab--active'
                  : ''
              }`}
              onClick={() => {
                changeActiveTab('campaigns');
              }}
            >
              <SisgesIcon name="campaign" aria-hidden="true" />
              <span>Campañas</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'supervisors'}
              className={`portfolio-detail-tab ${
                activeTab === 'supervisors'
                  ? 'portfolio-detail-tab--active'
                  : ''
              }`}
              onClick={() => {
                if (
                  contextualSupervisorFilter?.value ===
                  PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID
                ) {
                  contextualSupervisorFilter.onChange(null);
                }

                changeActiveTab('supervisors');
              }}
            >
              <SisgesIcon name="users" aria-hidden="true" />
              <span>Supervisores / equipos</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'advisors'}
              className={`portfolio-detail-tab ${
                activeTab === 'advisors'
                  ? 'portfolio-detail-tab--active'
                  : ''
              }`}
              onClick={() => {
                changeActiveTab('advisors');
              }}
            >
              <SisgesIcon name="user" aria-hidden="true" />
              <span>Asesores</span>
            </button>
          </div>
        </div>
      )}
    >
      <div
        className="analytics-table-surface portfolio-detail-panel"
        role="tabpanel"
      >
        {activeTab === 'campaigns' && (
          <RendimientoCampanaTable items={sortedCampaigns} />
        )}
        {activeTab !== 'campaigns' &&
          renderSupervisorOrAdvisorPanel()}
      </div>
    </AnalyticsPanel>
  );
};
