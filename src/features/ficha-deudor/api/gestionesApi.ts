import { env } from '@app/config/env';
import { apiClient } from '../../../shared/api/apiClient';

import type {
  ApiResponse,
  ApiResponseSimple,
  DocumentoApi,
  CabeceraPantallaApi,
  ColumnApi,
  BotonApi,
} from '../../../shared/types/indexApi';

import { DOCUMENTOS_ERROR_MESSAGES, DOCUMENTOS_FETCH_ALL_PAGE_NUMBER, DOCUMENTOS_FETCH_ALL_PAGE_SIZE } from '../constants/documentos.constants';
import { mapCabecerasToColumns } from '../mappers/gestionDocumentos.mapper';
import { mockBotones } from '../mocks/documentosBotones.mock';

const BASE_GESTION = '/v1/Gestion';
const BASE_DOCUMENTOS = '/v1/documentos';

const GESTION_ENDPOINTS = {
  CABECERA: `${BASE_GESTION}/GetGestionDocumentosCabecera`,
  DOCUMENTOS: `${BASE_GESTION}/GetGestionDocumentos`,
  BOTONES: `${BASE_DOCUMENTOS}/botones`,
} as const;

interface GestionDocumentosParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
  pageNumber: number;
  pageSize: number;
}

const assertSuccessfulResponse = <T extends { statusCode: number; message?: string }>(
  result: T,
  fallbackMessage: string
) => {
  if (result.statusCode !== 200) {
    throw new Error(result.message || fallbackMessage);
  }
};

const buildGestionDocumentosParams = ({
  idCliente,
  idCartera,
  idDeudor,
  pageNumber,
  pageSize,
}: GestionDocumentosParams) => {
  return new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
    nId_Persdeudor: idDeudor,
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });
};

export async function fetchColumnas(
  id_cliente: string,
  id_contrato: string
): Promise<ColumnApi[]> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Contrato: id_contrato,
  });

  const result = await apiClient<ApiResponseSimple<CabeceraPantallaApi[]>>(
    `${GESTION_ENDPOINTS.CABECERA}?${params.toString()}`
  );

  assertSuccessfulResponse(result, DOCUMENTOS_ERROR_MESSAGES.HEADERS);

  return mapCabecerasToColumns(result.response);
}

export async function fetchBotones(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  id_usuario: string
): Promise<BotonApi[]> {
  const params = new URLSearchParams({
    id_cliente,
  });

  return apiClient<BotonApi[]>(
    `${GESTION_ENDPOINTS.BOTONES}?${params.toString()}`,
    {
      mock: () =>
        mockBotones({
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
    `${GESTION_ENDPOINTS.DOCUMENTOS}?${params.toString()}`
  );

  assertSuccessfulResponse(result, DOCUMENTOS_ERROR_MESSAGES.DATA);

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
    `${GESTION_ENDPOINTS.DOCUMENTOS}?${params.toString()}`
  );
}