import { isPortfolioBusinessUnitTransitionPending } from '../domain/portfolioFilterContext';
import type {
  PortfolioControlCenterFilterOptions,
  PortfolioControlCenterFilters,
} from '../domain/portfolioFilters.types';
import type {
  PortfolioControlCenterData,
} from '../domain/portfolioOverview.types';

export interface PortfolioControlCenterViewState {
  effectiveBusinessUnit: string | null;
  clearBusinessUnit: string | null;
  confirmedBusinessUnit: string | null;
  isBusinessUnitTransitionPending: boolean;
  visibleData: PortfolioControlCenterData | null;
  visibleIsLoading: boolean;
}

interface ResolvePortfolioControlCenterViewStateParams {
  filters: PortfolioControlCenterFilters;
  filterOptions: PortfolioControlCenterFilterOptions;
  data: PortfolioControlCenterData | null;
  isLoading: boolean;
  error: string | null;
}

export const resolvePortfolioControlCenterViewState = ({
  filters,
  filterOptions,
  data,
  isLoading,
  error,
}: ResolvePortfolioControlCenterViewStateParams): PortfolioControlCenterViewState => {
  const effectiveBusinessUnit =
    filters.businessUnit ?? filterOptions.selectedBusinessUnit;
  const clearBusinessUnit =
    filterOptions.selectedBusinessUnit ?? filters.businessUnit;
  const confirmedBusinessUnit =
    data?.context.businessUnit ?? filterOptions.selectedBusinessUnit;
  const isBusinessUnitTransitionPending =
    isPortfolioBusinessUnitTransitionPending(
      filters.businessUnit,
      confirmedBusinessUnit
    );

  return {
    effectiveBusinessUnit,
    clearBusinessUnit,
    confirmedBusinessUnit,
    isBusinessUnitTransitionPending,
    visibleData: isBusinessUnitTransitionPending ? null : data,
    visibleIsLoading:
      isLoading ||
      (isBusinessUnitTransitionPending && error === null),
  };
};
