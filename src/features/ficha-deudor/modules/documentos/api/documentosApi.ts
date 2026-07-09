import { env } from '@app/config/env';
import { apiClient } from '@shared/api/apiClient';

import type {
  ApiResponse,
  ApiResponseSimple
} from '@shared/types/indexApi';
import type {
  DocumentoApi,
  CabeceraPantallaApi,
  ColumnApi,
  BotonApi,
} from '../../../shared/types';

import {
  DOCUMENTOS_ERROR_MESSAGES,
  DOCUMENTOS_FETCH_ALL_PAGE_NUMBER,
  DOCUMENTOS_FETCH_ALL_PAGE_SIZE,
} from '../constants/documentos.constants';
import { DOCUMENTOS_API_ENDPOINTS } from '../constants/documentosApi.constants';
import { buildDocumentosBotones } from '../constants/documentosBotones.constants';
import { mapCabecerasToColumns } from '../mappers/documentos.mapper';
import { assertApiSuccess } from '../../../shared/utils/apiResponse.utils';
import {
  buildDocumentosBotonesParams,
  buildDocumentosCabeceraParams,
  buildGestionDocumentosParams,
} from '../utils/documentosParams.utils';

export async function fetchColumnas(
  id_cliente: string,
  id_contrato: string
): Promise<ColumnApi[]> {
  const params = buildDocumentosCabeceraParams({
    idCliente: id_cliente,
    idContrato: id_contrato,
  });

  const result = await apiClient<ApiResponseSimple<CabeceraPantallaApi[]>>(
    `${DOCUMENTOS_API_ENDPOINTS.CABECERA}?${params.toString()}`
  );

  assertApiSuccess(result, DOCUMENTOS_ERROR_MESSAGES.HEADERS);

  return mapCabecerasToColumns(result.response);
}

export async function fetchBotones(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  id_usuario: string
): Promise<BotonApi[]> {
  const params = buildDocumentosBotonesParams(id_cliente);

  return apiClient<BotonApi[]>(
    `${DOCUMENTOS_API_ENDPOINTS.BOTONES}?${params.toString()}`,
    {
      mock: () =>
        buildDocumentosBotones({
          idCliente: id_cliente,
          idCartera: id_cartera,
          idDeudor: id_deudor,
          idUsuario: id_usuario,
        }),
      useMock: env.useDocumentosMock,
    }
  );
}

export async function fetchAllGestiones(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string
): Promise<DocumentoApi[]> {
  const params = buildGestionDocumentosParams({
    idCliente: id_cliente,
    idCartera: id_cartera,
    idDeudor: id_deudor,
    pageNumber: DOCUMENTOS_FETCH_ALL_PAGE_NUMBER,
    pageSize: DOCUMENTOS_FETCH_ALL_PAGE_SIZE,
  });

  const result = await apiClient<ApiResponse<DocumentoApi[]>>(
    `${DOCUMENTOS_API_ENDPOINTS.DOCUMENTOS}?${params.toString()}`
  );

  assertApiSuccess(result, DOCUMENTOS_ERROR_MESSAGES.DATA);

  return Array.isArray(result.response) ? result.response : [];
}

export async function fetchGestiones(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  pageNumber: number,
  pageSize: number
): Promise<ApiResponse<DocumentoApi[]>> {
  const params = buildGestionDocumentosParams({
    idCliente: id_cliente,
    idCartera: id_cartera,
    idDeudor: id_deudor,
    pageNumber,
    pageSize,
  });

  return apiClient<ApiResponse<DocumentoApi[]>>(
    `${DOCUMENTOS_API_ENDPOINTS.DOCUMENTOS}?${params.toString()}`
  );
}