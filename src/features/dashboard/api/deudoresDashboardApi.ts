import { apiClient } from '../../../shared/api/apiClient';
import type {
  BuscarDeudoresDashboardParams,
  DeudorDashboard,
  DeudorDashboardApi,
  GetDeudoresDashboardResponse,
} from '../../../shared/types';

const BASE_DEUDOR = '/v1/Deudor';

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

function mapDeudorDashboard(item: DeudorDashboardApi): DeudorDashboard {
  return {
    nId_PersDeudor: toNumber(item.nId_PersDeudor),
    nro: toNumber(item.nro),
    zonaCampanna: toStringValue(item.zonaCampanna),
    nId_Cliente: toNumber(item.nId_Cliente),
    nId_Contrato: toNumber(item.nId_Contrato),
    nId_Cartera: toNumber(item.nId_Cartera),
    cartera: toStringValue(item.cartera),
    codigoCliente: toStringValue(item.codigoCliente),
    deudor: toStringValue(item.deudor),
    importe: toNumber(item.importe),
    saldo: toNumber(item.saldo),
    fechaUltimaGestionCALL: toStringValue(item.fechaUltimaGestionCALL),
    ultimaGestionCALL: toStringValue(item.ultimaGestionCALL),
    cantidadGestionCALL: toNumber(item.cantidadGestionCALL),
    fechaUltimaGestionCAMPO: toStringValue(item.fechaUltimaGestionCAMPO),
    ultimaGestionCAMPO: toStringValue(item.ultimaGestionCAMPO),
    cantidadGestionCAMPO: toNumber(item.cantidadGestionCAMPO),
    fechaPromesa: toStringValue(item.fechaPromesa),
    mejorStatus: toStringValue(item.mejorStatus),
  };
}

export async function fetchDeudoresDashboard({
  nIdCliente,
  busqueda,
  pageNumber = 1,
  pageSize = 1000,
}: BuscarDeudoresDashboardParams): Promise<DeudorDashboard[]> {
  const params = new URLSearchParams({
    nId_Cliente: nIdCliente,
    busqueda,
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });

  const result = await apiClient<GetDeudoresDashboardResponse>(
    `${BASE_DEUDOR}/GetDeudorAsync?${params.toString()}`
  );

  if (result.statusCode !== 200) {
    throw new Error(
      result.messageUser ||
        result.message ||
        'Error al buscar el deudor.'
    );
  }

  const response = Array.isArray(result.response)
    ? result.response
    : result.response
      ? [result.response]
      : [];

  return response.map(mapDeudorDashboard);
}