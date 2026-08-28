import { apiClient } from '@shared/api/apiClient';
import {
  unwrapApiArrayResponse,
} from '../../../shared/utils/apiResponse.utils';
import type { Pago } from '../types/pago.types';
import { isPagoApi } from './pagosApi.validators';

const BASE_GESTION = '/v1/Gestion';
const PAGOS_ERROR_MESSAGE = 'Error cargando pagos';

export interface FetchPagosByDeudorParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
}

export async function fetchPagosByDeudor(
  { idCliente, idCartera, idDeudor }: FetchPagosByDeudorParams,
  signal?: AbortSignal
): Promise<Pago[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
    nId_Persdeudor: idDeudor,
    PageNumber: '1',
    PageSize: '1000',
  });

  const result = await apiClient<unknown>(
    `${BASE_GESTION}/GetGestionPagosDeudor?${params.toString()}`,
    { signal }
  );

  const pagos = unwrapApiArrayResponse(
    result,
    PAGOS_ERROR_MESSAGE,
    isPagoApi
  );

  return pagos.map((item) => ({
    nro: item.nro,
    codigoCliente: item.codigoCliente || '—',
    nroDocumento: item.nroDocumento || '—',
    fechaPago: item.fechaPago || '—',
    montoPago: item.montoPago ?? 0,
    moneda: item.moneda || '—',
    zona: item.zona || '—',
    notaCredito: item.notaCredito || '—',
    marca: item.marca || '—',
  }));
}
