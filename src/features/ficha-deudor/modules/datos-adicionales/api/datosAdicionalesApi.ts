import { apiClient } from '@shared/api/apiClient';
import type {
  CabeceraDatosAdicionalesApi,
  DatoAdicionalApi,
  ColumnApi,
} from '../../../shared/types';
import type {
  ApiResponse,
  ApiResponseSimple
} from '@shared/types/indexApi';
import {
  DATOS_ADICIONALES_ENDPOINTS,
  DATOS_ADICIONALES_ERROR_MESSAGES,
  DATOS_ADICIONALES_FETCH_PAGE_NUMBER,
  DATOS_ADICIONALES_FETCH_PAGE_SIZE,
} from '../constants/datosAdicionales.constants';
import { mapCabeceraDatosAdicionalesToColumns } from '../mappers/datosAdicionales.mapper';
import { assertApiSuccess } from '../../../shared/utils/apiResponse.utils';

const buildCabeceraDatosAdicionalesParams = (
  id_cliente: string,
  pantalla: number
) => {
  return new URLSearchParams({
    nId_Cliente: id_cliente,
    pantalla: String(pantalla),
  });
};

const buildDatosAdicionalesParams = (
  id_cliente: string,
  id_cartera: string,
  id_deudor: string
) => {
  return new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Cartera: id_cartera,
    nId_Persdeudor: id_deudor,
    PageNumber: String(DATOS_ADICIONALES_FETCH_PAGE_NUMBER),
    PageSize: String(DATOS_ADICIONALES_FETCH_PAGE_SIZE),
  });
};

export async function fetchCabeceraDatosAdicionales(
  id_cliente: string,
  pantalla: number
): Promise<ColumnApi[]> {
  const params = buildCabeceraDatosAdicionalesParams(id_cliente, pantalla);

  const result = await apiClient<ApiResponseSimple<CabeceraDatosAdicionalesApi>>(
    `${DATOS_ADICIONALES_ENDPOINTS.CABECERA}?${params.toString()}`
  );

  assertApiSuccess(result, DATOS_ADICIONALES_ERROR_MESSAGES.META);

  return mapCabeceraDatosAdicionalesToColumns(result.response);
}

export async function fetchAllDatosAdicionales(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string
): Promise<DatoAdicionalApi[]> {
  const params = buildDatosAdicionalesParams(
    id_cliente,
    id_cartera,
    id_deudor
  );

  const result = await apiClient<ApiResponse<DatoAdicionalApi[]>>(
    `${DATOS_ADICIONALES_ENDPOINTS.DATA}?${params.toString()}`
  );

  assertApiSuccess(result, DATOS_ADICIONALES_ERROR_MESSAGES.DATA);

  return result.response;
}