import type { SelectOption } from '../../../shared/types';

export type TipoBusquedaDashboard = 'R' | 'D' | 'T';

export const TIPO_BUSQUEDA_DASHBOARD_OPTIONS: SelectOption<TipoBusquedaDashboard>[] = [
  { id: 'R', label: 'RUC' },
  { id: 'D', label: 'DNI' },
  { id: 'T', label: 'TELÉFONO' },
];

export interface DeudorDashboardApi {
  nId_PersDeudor: number;
  nro: number;
  zonaCampanna: string;
  nId_Cliente: number;
  nId_Contrato: number;
  nId_Cartera: number;
  cartera: string;
  codigoCliente: string;
  deudor: string;
  importe: number;
  saldo: number;
  fechaUltimaGestionCALL: string;
  ultimaGestionCALL: string;
  cantidadGestionCALL: number;
  fechaUltimaGestionCAMPO: string;
  ultimaGestionCAMPO: string;
  cantidadGestionCAMPO: number;
  fechaPromesa: string;
  mejorStatus: string;
}

export interface DeudorDashboard {
  nId_PersDeudor: number;
  nro: number;
  zonaCampanna: string;
  nId_Cliente: number;
  nId_Contrato: number;
  nId_Cartera: number;
  cartera: string;
  codigoCliente: string;
  deudor: string;
  importe: number;
  saldo: number;
  fechaUltimaGestionCALL: string;
  ultimaGestionCALL: string;
  cantidadGestionCALL: number;
  fechaUltimaGestionCAMPO: string;
  ultimaGestionCAMPO: string;
  cantidadGestionCAMPO: number;
  fechaPromesa: string;
  mejorStatus: string;
}

export interface GetDeudoresDashboardResponse {
  code: string;
  message: string;
  messageUser: string;
  statusCode: number;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  response: DeudorDashboardApi[] | DeudorDashboardApi | null;
}

export interface BuscarDeudoresDashboardParams {
  nIdCliente: string;
  busqueda: string;
  pageNumber?: number;
  pageSize?: number;
}