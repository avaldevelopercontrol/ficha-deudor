export interface PagoApi {
  nro: number;
  codigoCliente: string;
  nroDocumento: string;
  fechaPago: string;
  montoPago: number;
  moneda: string;
  zona: string;
  notaCredito: string;
  marca: string;
}

export interface Pago {
  nro: number;
  codigoCliente: string;
  nroDocumento: string;
  fechaPago: string;
  montoPago: number;
  moneda: string;
  zona: string;
  notaCredito: string;
  marca: string;
}

export interface PagoListResponse {
  code: string;
  message: string;
  messageUser: string;
  statusCode: number;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  response: PagoApi[];
}