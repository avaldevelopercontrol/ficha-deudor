import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  CentroControlCarteraFilterOptions,
  PortfolioSupervisorFilterOption,
} from '../domain/filtrosCartera.types';
import {
  getPortfolioSupervisorOptionsForContext,
  CARTERA_UNASSIGNED_SUPERVISOR_FILTER_ID,
} from '../domain/filtroCarteraContext';

interface ResolveRendimientoCarteraSelectionParams {
  filterOptions: CentroControlCarteraFilterOptions;
  context: PortfolioOperationalContext | null;
  detailSupervisorId: string | null;
  hasUnassignedAdvisors: boolean;
}

export interface RendimientoCarteraSelection {
  contextualSupervisorOptions: readonly PortfolioSupervisorFilterOption[];
  isUnassignedSupervisorSelected: boolean;
  effectiveDetailSupervisorId: string | null;
  detailSupervisorFilterValue: string | null;
}

export const resolveRendimientoCarteraSelection = ({
  filterOptions,
  context,
  detailSupervisorId,
  hasUnassignedAdvisors,
}: ResolveRendimientoCarteraSelectionParams): RendimientoCarteraSelection => {
  const contextualSupervisorOptions =
    getPortfolioSupervisorOptionsForContext(
      filterOptions,
      context?.campaignId ?? null,
      context?.subPortfolioId ?? null,
      hasUnassignedAdvisors
    );

  const isUnassignedSupervisorSelected = Boolean(
    detailSupervisorId ===
      CARTERA_UNASSIGNED_SUPERVISOR_FILTER_ID &&
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
        ? CARTERA_UNASSIGNED_SUPERVISOR_FILTER_ID
        : effectiveDetailSupervisorId,
  };
};
