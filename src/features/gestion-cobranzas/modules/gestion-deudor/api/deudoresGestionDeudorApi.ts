import { apiClient } from '@shared/api/apiClient';
import {
  assertApiSuccess,
} from '@shared/api/apiResponse.utils';
import {
  fetchAllPagesInParallel,
} from '@shared/utils/pagedCollection.utils';
import { toRequiredId } from '@shared/utils/number.utils';
import {
  createInvalidGestionDeudorApiResponseError,
  parseGestionDeudorApiEnvelope,
  parseGestionDeudorApiPagination,
  type GestionDeudorApiPagination,
} from './gestionDeudorApiBoundary';
import {
  GESTION_DEUDOR_API_DEFAULTS,
  GESTION_DEUDOR_API_ENDPOINTS,
} from '../constants/gestionDeudorApi.constants';
import { mapDeudoresGestionDeudorResponse } from '../mappers/gestionDeudor.mapper';
import type {
  BuscarDeudoresGestionDeudorParams,
  DeudorGestionDeudor,
} from '../types/gestionDeudor.types';

const ERROR_MESSAGE = 'Error al buscar el deudor.';

interface DeudoresGestionDeudorPage
  extends GestionDeudorApiPagination {
  items: DeudorGestionDeudor[];
}

interface FetchDeudoresPageParams
  extends BuscarDeudoresGestionDeudorParams {
  pageNumber: number;
  pageSize: number;
}

const buildDeudoresEndpoint = ({
  idCliente,
  busqueda,
  pageNumber,
  pageSize,
}: FetchDeudoresPageParams): string => {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    busqueda,
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });

  return `${GESTION_DEUDOR_API_ENDPOINTS.baseDeudor}${GESTION_DEUDOR_API_ENDPOINTS.getDeudor}?${params.toString()}`;
};

const fetchDeudoresGestionDeudorPage = async (
  params: FetchDeudoresPageParams,
  signal?: AbortSignal
): Promise<DeudoresGestionDeudorPage> => {
  const rawResult = await apiClient<unknown>(
    buildDeudoresEndpoint(params),
    { signal }
  );
  const result = parseGestionDeudorApiEnvelope(
    rawResult,
    ERROR_MESSAGE
  );

  // Los errores de negocio tienen prioridad sobre la
  // validación de metadata paginada, para conservar el
  // mensaje que entrega el backend.
  assertApiSuccess(result, ERROR_MESSAGE);

  const pagination =
    parseGestionDeudorApiPagination(
      rawResult,
      ERROR_MESSAGE
    );

  if (
    pagination.pageNumber !== params.pageNumber ||
    pagination.pageSize !== params.pageSize
  ) {
    throw createInvalidGestionDeudorApiResponseError(
      ERROR_MESSAGE
    );
  }

  return {
    ...pagination,
    items: mapDeudoresGestionDeudorResponse(
      result.response
    ),
  };
};

export async function fetchDeudoresGestionDeudor(
  {
    idCliente,
    busqueda,
  }: BuscarDeudoresGestionDeudorParams,
  signal?: AbortSignal
): Promise<DeudorGestionDeudor[]> {
  const normalizedClientId = toRequiredId(
    idCliente,
    'idCliente'
  );
  const normalizedParams = {
    idCliente: String(normalizedClientId),
    busqueda,
  };
  const {
    firstPageNumber,
    pageSize,
  } = GESTION_DEUDOR_API_DEFAULTS;

  let expectedTotalPages: number | null = null;
  let expectedTotalRecords: number | null = null;

  const fetchPage = async (
    pageNumber: number
  ): Promise<DeudoresGestionDeudorPage> => {
    const page = await fetchDeudoresGestionDeudorPage(
      {
        ...normalizedParams,
        pageNumber,
        pageSize,
      },
      signal
    );

    if (expectedTotalPages === null) {
      expectedTotalPages = page.totalPages;
      expectedTotalRecords = page.totalRecords;
    } else if (
      page.totalPages !== expectedTotalPages ||
      page.totalRecords !== expectedTotalRecords
    ) {
      throw createInvalidGestionDeudorApiResponseError(
        ERROR_MESSAGE
      );
    }

    return page;
  };

  const items = await fetchAllPagesInParallel<
    DeudoresGestionDeudorPage,
    DeudorGestionDeudor
  >({
    firstPageNumber,
    fetchPage,
    getItems: (page) => page.items,
    getTotalPages: (page) => page.totalPages,
  });

  if (
    expectedTotalRecords !== null &&
    items.length !== expectedTotalRecords
  ) {
    throw createInvalidGestionDeudorApiResponseError(
      ERROR_MESSAGE
    );
  }

  return items;
}
