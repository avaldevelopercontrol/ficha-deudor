import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import type {
  DetalleCarteraTab,
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  CentroControlCarteraFilterOptions,
} from '../domain/filtrosCartera.types';
import {
  resolveRendimientoCarteraSelection,
} from '../application/rendimientoCarteraSelection.application';
import {
  useRendimientoAsesorCartera,
  useRendimientoSupervisorCartera,
} from './useRendimientoCarteraDetail';

interface UseRendimientoCarteraControllerParams {
  crmClientId: number;
  context: PortfolioOperationalContext | null;
  filterOptions: CentroControlCarteraFilterOptions;
}

export const useRendimientoCarteraController = ({
  crmClientId,
  context,
  filterOptions,
}: UseRendimientoCarteraControllerParams) => {
  const [detailSupervisorId, setDetailSupervisorId] =
    useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] =
    useState<DetalleCarteraTab>('campaigns');

  const supervisorDetail = useRendimientoSupervisorCartera({
    crmClientId,
    context,
    enabled: activeDetailTab === 'supervisors',
  });

  const baseAdvisorDetail = useRendimientoAsesorCartera({
    crmClientId,
    context,
    supervisorId: null,
    enabled:
      activeDetailTab === 'advisors' &&
      detailSupervisorId === null,
  });

  const selection = useMemo(
    () =>
      resolveRendimientoCarteraSelection({
        filterOptions,
        context,
        detailSupervisorId,
        hasUnassignedAdvisors: false,
      }),
    [
      context,
      detailSupervisorId,
      filterOptions,
    ]
  );

  const filteredAdvisorDetail = useRendimientoAsesorCartera({
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

  const detailAdvisors =
    activeAdvisorDetail.data?.advisors ?? [];

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
