import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  resolveCentroControlCarteraViewState,
} from '../application/portfolioView.application';
import {
  DEFAULT_CENTRO_CONTROL_CARTERA_FILTERS,
} from '../constants/centroControlCartera.constants';
import {
  switchUnidadNegocioCartera,
} from '../domain/filtroCarteraContext';
import type {
  CentroControlCarteraFilters,
} from '../domain/filtrosCartera.types';
import { useAutoActualizacionCartera } from './useAutoActualizacionCartera';
import { useCentroControlCarteraBootstrap } from './useCentroControlCarteraBootstrap';
import { useEvolucionComparativaCartera } from './useEvolucionComparativaCartera';
import { useRendimientoCarteraController } from './useRendimientoCarteraController';

interface CentroControlCarteraClientScope {
  crmClientId: number;
  name: string;
}

interface UseCentroControlCarteraPageControllerParams {
  scopes: readonly CentroControlCarteraClientScope[];
  selectedCrmClientId: number;
}

export const useCentroControlCarteraPageController = ({
  scopes,
  selectedCrmClientId,
}: UseCentroControlCarteraPageControllerParams) => {
  const [filters, setFilters] =
    useState<CentroControlCarteraFilters>(
      DEFAULT_CENTRO_CONTROL_CARTERA_FILTERS
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
      (item) => item.crmClientId === selectedCrmClientId
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

  const clientOptions = useMemo(
    () =>
      scopes.map((scope) => ({
        id: String(scope.crmClientId),
        label:
          scope.name ||
          `Cliente ${scope.crmClientId}`,
      })),
    [scopes]
  );

  const performanceController =
    useRendimientoCarteraController({
      crmClientId: selectedCrmClientId,
      context: visibleData?.context ?? null,
      filterOptions,
    });

  const evolutionComparison = useEvolucionComparativaCartera(
    selectedCrmClientId,
    visibleData?.context ?? null
  );

  const { resetDetailSupervisor } = performanceController;

  useAutoActualizacionCartera({ refetch });

  const handleFiltersChange = useCallback((
    nextFilters: CentroControlCarteraFilters
  ) => {
    resetDetailSupervisor();
    setFilters(nextFilters);
  }, [resetDetailSupervisor]);

  const handleClearFilters = useCallback(() => {
    resetDetailSupervisor();
    setFilters((currentFilters) =>
      clearBusinessUnit
        ? switchUnidadNegocioCartera(
            currentFilters,
            clearBusinessUnit
          )
        : DEFAULT_CENTRO_CONTROL_CARTERA_FILTERS
    );
  }, [clearBusinessUnit, resetDetailSupervisor]);

  const retryFilterOptions = useCallback(() => {
    void refetchFilterOptions();
  }, [refetchFilterOptions]);

  const retryData = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    filters,
    filterOptions,
    clientOptions,
    portfolioOption,
    areFiltersLoading,
    filterOptionsError,
    effectiveBusinessUnit,
    visibleData,
    visibleIsLoading,
    error,
    performanceController,
    evolutionComparison,
    handleFiltersChange,
    handleClearFilters,
    retryFilterOptions,
    retryData,
  };
};
