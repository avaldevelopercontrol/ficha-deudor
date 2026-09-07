export type TipoBusquedaGestionDeudor = 'R' | 'D' | 'F';

export interface DeudorGestionDeudor {
  idDeudor: number;
  numero: number;
  zonaCampania: string;
  idCliente: number;
  idContrato: number;
  idCartera: number;
  cartera: string;
  codigoCliente: string;
  deudor: string;
  importe: number;
  saldo: number;
  fechaUltimaGestionCall: string;
  ultimaGestionCall: string;
  cantidadGestionCall: number;
  fechaUltimaGestionCampo: string;
  ultimaGestionCampo: string;
  cantidadGestionCampo: number;
  fechaPromesa: string;
  mejorStatus: string;
}

export interface BuscarDeudoresGestionDeudorParams {
  idCliente: string;
  busqueda: string;
}
