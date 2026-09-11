import { apiClient } from '@shared/api/apiClient';
import { fetchAllPagesInParallel } from '@shared/utils/pagedCollection.utils';

import type {
  DocumentoApi,
  ColumnApi,
} from '../../../shared/types';

import {
  DOCUMENTOS_ERROR_MESSAGES,
  DOCUMENTOS_FETCH_FIRST_PAGE,
  DOCUMENTOS_FETCH_PAGE_SIZE,
} from '../constants/documentos.constants';
import { DOCUMENTOS_API_ENDPOINTS } from '../constants/documentosApi.constants';
import { mapCabecerasToColumns } from '../mappers/documentos.mapper';
import {
  unwrapApiArrayResponse,
  unwrapApiPaginatedArrayResponse,
  type ApiPaginatedData,
} from '../../../shared/utils/apiResponse.utils';
import {
  isCabeceraPantallaApi,
  isDocumentoApi,
} from './documentosApi.validators';
import {
  buildDocumentosCabeceraParams,
  buildGestionDocumentosParams,
} from '../utils/documentosParams.utils';

interface FetchDocumentosColumnasParams {
  idCliente: string;
  idContrato: string;
}

interface FetchDocumentosParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
}

interface FetchDocumentosPageParams extends FetchDocumentosParams {
  pageNumber: number;
  pageSize: number;
}

export async function fetchColumnas(
  { idCliente, idContrato }: FetchDocumentosColumnasParams,
  signal?: AbortSignal
): Promise<ColumnApi[]> {
  const params = buildDocumentosCabeceraParams({
    idCliente,
    idContrato,
  });

  const result =
    await apiClient<unknown>(
      `${DOCUMENTOS_API_ENDPOINTS.CABECERA}?${params.toString()}`,
      { signal }
    );

  const cabeceras = unwrapApiArrayResponse(
    result,
    DOCUMENTOS_ERROR_MESSAGES.HEADERS,
    isCabeceraPantallaApi
  );

  return mapCabecerasToColumns(cabeceras);
}

const fetchGestionesPage = async (
  {
    idCliente,
    idCartera,
    idDeudor,
    pageNumber,
    pageSize,
  }: FetchDocumentosPageParams,
  signal?: AbortSignal
): Promise<ApiPaginatedData<DocumentoApi>> => {
  const params = buildGestionDocumentosParams({
    idCliente,
    idCartera,
    idDeudor,
    pageNumber,
    pageSize,
  });

  const result = await apiClient<unknown>(
    `${DOCUMENTOS_API_ENDPOINTS.DOCUMENTOS}?${params.toString()}`,
    { signal }
  );

  return unwrapApiPaginatedArrayResponse(
    result,
    DOCUMENTOS_ERROR_MESSAGES.DATA,
    isDocumentoApi
  );
};

export async function fetchAllGestiones(
  params: FetchDocumentosParams,
  signal?: AbortSignal
): Promise<DocumentoApi[]> {
  return fetchAllPagesInParallel({
    firstPageNumber: DOCUMENTOS_FETCH_FIRST_PAGE,
    fetchPage: (pageNumber) =>
      fetchGestionesPage(
        {
          ...params,
          pageNumber,
          pageSize: DOCUMENTOS_FETCH_PAGE_SIZE,
        },
        signal
      ),
    getItems: (page) => page.data,
    getTotalPages: (page) => page.totalPages,
  });
}
