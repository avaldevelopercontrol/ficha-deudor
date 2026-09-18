import {
  fetchCentroControlCarteraBootstrap,
  fetchCentroControlCarteraOverview,
} from '../api/centroControlCarteraApi';
import type {
  CentroControlCarteraFilterOptions,
  CentroControlCarteraFilters,
} from '../domain/filtrosCartera.types';
import type {
  CentroControlCarteraData,
} from '../domain/panoramaCartera.types';
import { mapOpcionesFiltroCarteraResponse } from '../mappers/filtrosCartera.mapper';
import { mapPanoramaCarteraResponse } from '../mappers/panoramaCartera.mapper';

export interface CentroControlCarteraBootstrapData {
  data: CentroControlCarteraData | null;
  filterOptions: CentroControlCarteraFilterOptions;
}

const assertGlobalFiltersSupported = (
  filters: CentroControlCarteraFilters
): void => {
  if (filters.supervisorId) {
    throw new Error(
      'Supervisor permanece restringido como filtro global porque los KPIs superiores no tienen una semántica canonical atribuible a supervisor.'
    );
  }
};

export const loadCentroControlCarteraBootstrap = async (
  crmClientId: number,
  filters: CentroControlCarteraFilters,
  signal: AbortSignal
): Promise<CentroControlCarteraBootstrapData> => {
  assertGlobalFiltersSupported(filters);

  const response = await fetchCentroControlCarteraBootstrap(
    crmClientId,
    filters,
    signal
  );
  const filterOptions = mapOpcionesFiltroCarteraResponse(
    response.filterOptions
  );

  return {
    data:
      response.overview === null
        ? null
        : mapPanoramaCarteraResponse(
            response.overview,
            filters.subPortfolioId,
            filterOptions.selectedBusinessUnit
          ),
    filterOptions,
  };
};

export const loadCentroControlCartera = async (
  crmClientId: number,
  filters: CentroControlCarteraFilters,
  signal: AbortSignal
): Promise<CentroControlCarteraData> => {
  assertGlobalFiltersSupported(filters);

  const response = await fetchCentroControlCarteraOverview(
    crmClientId,
    filters,
    signal
  );

  return mapPanoramaCarteraResponse(
    response,
    filters.subPortfolioId,
    filters.businessUnit
  );
};
