import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import type {
  PortfolioControlCenterFilterOptions,
  PortfolioDetailTab,
  PortfolioOperationalContext,
} from '../../../types/portfolioControlCenter.types';
import {
  PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID,
} from '../utils/portfolioFilterContext.utils';
import {
  resolvePortfolioPerformanceSelection,
} from '../utils/portfolioPerformanceController.utils';
import {
  usePortfolioAdvisorPerformance,
  usePortfolioSupervisorPerformance,
} from './usePortfolioPerformanceDetail';

interface UsePortfolioPerformanceControllerParams {
  crmClientId: number;
  context: PortfolioOperationalContext | null;
  filterOptions: PortfolioControlCenterFilterOptions;
}

export const usePortfolioPerformanceController = ({
  crmClientId,
  context,
  filterOptions,
}: UsePortfolioPerformanceControllerParams) => {
  const [detailSupervisorId, setDetailSupervisorId] =
    useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] =
    useState<PortfolioDetailTab>('campaigns');

  const supervisorDetail = usePortfolioSupervisorPerformance({
    crmClientId,
    context,
    enabled: activeDetailTab === 'supervisors',
  });

  const baseAdvisorDetail = usePortfolioAdvisorPerformance({
    crmClientId,
    context,
    supervisorId: null,
    enabled:
      activeDetailTab === 'advisors' &&
      (detailSupervisorId === null ||
        detailSupervisorId ===
          PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID),
  });

  const hasUnassignedAdvisors = Boolean(
    baseAdvisorDetail.data?.advisors.some(
      (item) => item.currentSupervisorId === null
    )
  );

  const selection = useMemo(
    () =>
      resolvePortfolioPerformanceSelection({
        filterOptions,
        context,
        detailSupervisorId,
        hasUnassignedAdvisors,
      }),
    [
      context,
      detailSupervisorId,
      filterOptions,
      hasUnassignedAdvisors,
    ]
  );

  const filteredAdvisorDetail = usePortfolioAdvisorPerformance({
    crmClientId,
    context,
    supervisorId: selection.effectiveDetailSupervisorId,
    enabled:
      activeDetailTab === 'advisors' &&
      Boolean(selection.effectiveDetailSupervisorId),
  });

  const activeAdvisorDetail =
    selection.effectiveDetailSupervisorId
      ? filteredAdvisorDetail
      : baseAdvisorDetail;

  const activeDetailResource =
    activeDetailTab === 'supervisors'
      ? supervisorDetail
      : activeAdvisorDetail;

  const detailAdvisors = selection.isUnassignedSupervisorSelected
    ? baseAdvisorDetail.data?.advisors.filter(
        (item) => item.currentSupervisorId === null
      ) ?? []
    : activeAdvisorDetail.data?.advisors ?? [];

  const resetDetailSupervisor = useCallback(() => {
    setDetailSupervisorId(null);
  }, []);

  return {
    supervisors: supervisorDetail.data?.supervisors ?? [],
    advisors: detailAdvisors,
    onActiveTabChange: setActiveDetailTab,
    resetDetailSupervisor,
    supervisorFilter: {
      value: selection.detailSupervisorFilterValue,
      options: selection.contextualSupervisorOptions,
      isLoading: activeDetailResource.isLoading,
      error: activeDetailResource.error,
      onChange: setDetailSupervisorId,
      onRetry: activeDetailResource.refetch,
    },
  };
};
