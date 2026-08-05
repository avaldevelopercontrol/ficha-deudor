import { apiClient } from '@shared/api/apiClient';
import type { ApiResponse } from '@shared/types/indexApi';
import {
  unwrapApiArrayResponse,
} from '../../../shared/utils/apiResponse.utils';
import type { Pago, PagoApi } from '../types/pago.types';

const BASE_GESTION = '/v1/Gestion';
const PAGOS_ERROR_MESSAGE = 'Error cargando pagos';

export async function fetchPagosByDeudor(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  signal?: AbortSignal
): Promise<Pago[]> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Cartera: id_cartera,
    nId_Persdeudor: id_deudor,
    PageNumber: '1',
    PageSize: '1000',
  });

  const result = await apiClient<ApiResponse<PagoApi[]>>(
    `${BASE_GESTION}/GetGestionPagosDeudor?${params.toString()}`,
    { signal }
  );

  const pagos = unwrapApiArrayResponse<PagoApi>(
    result,
    PAGOS_ERROR_MESSAGE
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
