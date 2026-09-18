import { isUnidadNegocioCarteraTransitionPending } from '../domain/filtroCarteraContext';
import type {
  CentroControlCarteraFilterOptions,
  CentroControlCarteraFilters,
} from '../domain/filtrosCartera.types';
import type {
  CentroControlCarteraData,
} from '../domain/panoramaCartera.types';

export interface CentroControlCarteraViewState {
  effectiveBusinessUnit: string | null;
  clearBusinessUnit: string | null;
  confirmedBusinessUnit: string | null;
  isBusinessUnitTransitionPending: boolean;
  visibleData: CentroControlCarteraData | null;
  visibleIsLoading: boolean;
}

interface ResolveCentroControlCarteraViewStateParams {
  filters: CentroControlCarteraFilters;
  filterOptions: CentroControlCarteraFilterOptions;
  data: CentroControlCarteraData | null;
  isLoading: boolean;
  error: string | null;
}

export const resolveCentroControlCarteraViewState = ({
  filters,
  filterOptions,
  data,
  isLoading,
  error,
}: ResolveCentroControlCarteraViewStateParams): CentroControlCarteraViewState => {
  const effectiveBusinessUnit =
    filters.businessUnit ?? filterOptions.selectedBusinessUnit;
  const clearBusinessUnit =
    filterOptions.selectedBusinessUnit ?? filters.businessUnit;
  const confirmedBusinessUnit =
    data?.context.businessUnit ?? filterOptions.selectedBusinessUnit;
  const isBusinessUnitTransitionPending =
    isUnidadNegocioCarteraTransitionPending(
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
