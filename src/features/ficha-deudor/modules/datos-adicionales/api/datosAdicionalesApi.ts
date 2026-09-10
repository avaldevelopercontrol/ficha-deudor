import { apiClient } from '@shared/api/apiClient';
import type {
  CabeceraDatosAdicionalesApi,
  DatoAdicionalApi,
  ColumnApi,
} from '../../../shared/types';
import {
  DATOS_ADICIONALES_ENDPOINTS,
  DATOS_ADICIONALES_ERROR_MESSAGES,
  DATOS_ADICIONALES_FETCH_PAGE_NUMBER,
  DATOS_ADICIONALES_FETCH_PAGE_SIZE,
} from '../constants/datosAdicionales.constants';
import { mapCabeceraDatosAdicionalesToColumns } from '../mappers/datosAdicionales.mapper';
import {
  unwrapApiArrayResponse,
  unwrapApiNullableObjectResponse,
} from '../../../shared/utils/apiResponse.utils';
import {
  isCabeceraDatosAdicionalesApi,
  isDatoAdicionalApi,
} from './datosAdicionalesApi.validators';

export interface FetchCabeceraDatosAdicionalesParams {
  idCliente: string;
  pantalla: number;
}

export interface FetchDatosAdicionalesParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
}

export interface CabeceraDatosAdicionalesResult {
  isConfigured: boolean;
  columns: ColumnApi[];
}

const buildCabeceraDatosAdicionalesParams = ({
  idCliente,
  pantalla,
}: FetchCabeceraDatosAdicionalesParams) => {
  return new URLSearchParams({
    nId_Cliente: idCliente,
    pantalla: String(pantalla),
  });
};

const buildDatosAdicionalesParams = ({
  idCliente,
  idCartera,
  idDeudor,
}: FetchDatosAdicionalesParams) => {
  return new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
    nId_Persdeudor: idDeudor,
    PageNumber: String(DATOS_ADICIONALES_FETCH_PAGE_NUMBER),
    PageSize: String(DATOS_ADICIONALES_FETCH_PAGE_SIZE),
  });
};

export async function fetchCabeceraDatosAdicionales(
  params: FetchCabeceraDatosAdicionalesParams,
  signal?: AbortSignal
): Promise<CabeceraDatosAdicionalesResult> {
  const searchParams = buildCabeceraDatosAdicionalesParams(params);

  const result = await apiClient<unknown>(
    `${DATOS_ADICIONALES_ENDPOINTS.CABECERA}?${searchParams.toString()}`,
    { signal }
  );

  const cabecera = unwrapApiNullableObjectResponse<CabeceraDatosAdicionalesApi>(
    result,
    DATOS_ADICIONALES_ERROR_MESSAGES.META,
    isCabeceraDatosAdicionalesApi
  );

  if (cabecera === null) {
    return {
      isConfigured: false,
      columns: [],
    };
  }

  const columns = mapCabeceraDatosAdicionalesToColumns(cabecera);

  return {
    isConfigured: columns.length > 0,
    columns,
  };
}

export async function fetchAllDatosAdicionales(
  params: FetchDatosAdicionalesParams,
  signal?: AbortSignal
): Promise<DatoAdicionalApi[]> {
  const searchParams = buildDatosAdicionalesParams(params);

  const result = await apiClient<unknown>(
    `${DATOS_ADICIONALES_ENDPOINTS.DATA}?${searchParams.toString()}`,
    { signal }
  );

  return unwrapApiArrayResponse<DatoAdicionalApi>(
    result,
    DATOS_ADICIONALES_ERROR_MESSAGES.DATA,
    isDatoAdicionalApi
  );
}