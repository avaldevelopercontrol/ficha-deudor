import type { ApiResponse } from '@shared/types/indexApi';

export type TipoBusquedaGestionDeudor = 'R' | 'D' | 'F';

export interface DeudorGestionDeudorApi {
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

export interface DeudorGestionDeudor {
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

export type GetDeudoresGestionDeudorResponse = ApiResponse<
  | DeudorGestionDeudorApi[]
  | DeudorGestionDeudorApi
  | null
>;

export interface BuscarDeudoresGestionDeudorParams {
  nIdCliente: string;
  busqueda: string;
  pageNumber?: number;
  pageSize?: number;
}
