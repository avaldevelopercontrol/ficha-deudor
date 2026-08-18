import type React from 'react';
import { useMemo, useState } from 'react';

import {
  SelectField,
} from '@shared/components/ui';
import { SisgesIcon } from '@shared/icons/sisges';
import type {
  AdvisorPerformanceItem,
  CampaignPerformanceItem,
  PortfolioSupervisorFilterOption,
  SupervisorPerformanceItem,
} from '../../../types/portfolioControlCenter.types';
import {
  PORTFOLIO_DETAIL_SORT_OPTIONS,
  sortAdvisorPerformanceByHighest,
  sortCampaignPerformanceByHighest,
  sortSupervisorPerformanceByHighest,
} from '../utils/portfolioDetailSort.utils';
import {
  PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID,
} from '../utils/portfolioFilterContext.utils';
import {
  AdvisorPerformanceTable,
} from './AdvisorPerformanceTable';
import {
  CampaignPerformanceTable,
} from './CampaignPerformanceTable';
import {
  PortfolioResourceState,
} from './PortfolioResourceState';
import {
  SupervisorPerformanceTable,
} from './SupervisorPerformanceTable';

type PortfolioDetailTab =
  | 'campaigns'
  | 'supervisors'
  | 'advisors';

interface PortfolioDetailTabsProps {
  campaigns: readonly CampaignPerformanceItem[];
  supervisors: readonly SupervisorPerformanceItem[];
  advisors: readonly AdvisorPerformanceItem[];
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

interface PortfolioDetailSortState {
  campaigns: string;
  supervisors: string;
  advisors: string;
}

const EMPTY_SORT_STATE: PortfolioDetailSortState = {
  campaigns: '',
  supervisors: '',
  advisors: '',
};

export const PortfolioDetailTabs: React.FC<
  PortfolioDetailTabsProps
> = ({
  campaigns,
  supervisors,
  advisors,
  contextualSupervisorFilter,
}) => {
  const [activeTab, setActiveTab] =
    useState<PortfolioDetailTab>('campaigns');
  const [sortByTab, setSortByTab] =
    useState<PortfolioDetailSortState>(EMPTY_SORT_STATE);

  const showContextualSupervisorFilter = Boolean(
    contextualSupervisorFilter?.enabled &&
      activeTab !== 'campaigns'
  );
  const isContextualRequestActive = Boolean(
    showContextualSupervisorFilter &&
      contextualSupervisorFilter?.value
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
      sortCampaignPerformanceByHighest(
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

  const renderSupervisorOrAdvisorPanel = () => {
    if (
      isContextualRequestActive &&
      contextualSupervisorFilter
    ) {
      return (
        <PortfolioResourceState
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
        </PortfolioResourceState>
      );
    }

    return activeTab === 'supervisors' ? (
      <SupervisorPerformanceTable items={sortedSupervisors} />
    ) : (
      <AdvisorPerformanceTable items={sortedAdvisors} />
    );
  };

  return (
    <section className="portfolio-control-center__section portfolio-control-center__section--detail">
      <div className="portfolio-control-center__detail-header">
        <div>
          <h2>
            <span
              className="portfolio-heading-icon portfolio-heading-icon--detail"
              aria-hidden="true"
            >
              <SisgesIcon name="bar-chart" />
            </span>
            Detalle operativo
          </h2>
          <p>
            Compara campañas, equipos y asesores sin abandonar el Control Center.
          </p>
        </div>

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
                setActiveTab('campaigns');
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

                setActiveTab('supervisors');
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
                setActiveTab('advisors');
              }}
            >
              <SisgesIcon name="user" aria-hidden="true" />
              <span>Asesores</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className="portfolio-detail-panel"
        role="tabpanel"
      >
        {activeTab === 'campaigns' && (
          <CampaignPerformanceTable items={sortedCampaigns} />
        )}
        {activeTab !== 'campaigns' &&
          renderSupervisorOrAdvisorPanel()}
      </div>
    </section>
  );
};
