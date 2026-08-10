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
