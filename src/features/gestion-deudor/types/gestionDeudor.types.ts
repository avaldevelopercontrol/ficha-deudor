export type TipoBusquedaGestionDeudor = 'R' | 'D' | 'T';

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

export interface GetDeudoresGestionDeudorResponse {
  code: string;
  message: string;
  messageUser: string;
  statusCode: number;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  response: DeudorGestionDeudorApi[] | DeudorGestionDeudorApi | null;
}

export interface BuscarDeudoresGestionDeudorParams {
  nIdCliente: string;
  busqueda: string;
  pageNumber?: number;
  pageSize?: number;
}
