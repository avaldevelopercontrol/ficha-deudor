import type {
  PortfolioOperationalContext,
} from '../domain/portfolioOverview.types';
import type {
  PortfolioControlCenterFilterOptions,
  PortfolioSupervisorFilterOption,
} from '../domain/portfolioFilters.types';
import {
  getPortfolioSupervisorOptionsForContext,
  PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID,
} from '../domain/portfolioFilterContext';

interface ResolvePortfolioPerformanceSelectionParams {
  filterOptions: PortfolioControlCenterFilterOptions;
  context: PortfolioOperationalContext | null;
  detailSupervisorId: string | null;
  hasUnassignedAdvisors: boolean;
}

export interface PortfolioPerformanceSelection {
  contextualSupervisorOptions: readonly PortfolioSupervisorFilterOption[];
  isUnassignedSupervisorSelected: boolean;
  effectiveDetailSupervisorId: string | null;
  detailSupervisorFilterValue: string | null;
}

export const resolvePortfolioPerformanceSelection = ({
  filterOptions,
  context,
  detailSupervisorId,
  hasUnassignedAdvisors,
}: ResolvePortfolioPerformanceSelectionParams): PortfolioPerformanceSelection => {
  const contextualSupervisorOptions =
    getPortfolioSupervisorOptionsForContext(
      filterOptions,
      context?.campaignId ?? null,
      context?.subPortfolioId ?? null,
      hasUnassignedAdvisors
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

  return {
    contextualSupervisorOptions,
    isUnassignedSupervisorSelected,
    effectiveDetailSupervisorId,
    detailSupervisorFilterValue:
      isUnassignedSupervisorSelected
        ? PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID
        : effectiveDetailSupervisorId,
  };
};
