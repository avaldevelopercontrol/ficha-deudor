export interface CabeceraInfoApi {
  zona: string;
  ciudad: string;
  cCar_Nombre: string;
  cCampanna: string;
}

export interface CabeceraInfo {
  zona: string;
  cartera: string;
  campana: string;
}

export interface DeudorInfoApi {
  nId_PersDeudor: number;
  dni: string;
  ruc: string;
  nombre: string;
  nombreCompleto: string;
  gradoInstruccion: string;
  edad: string;
  correo: string;
  informacionAdicional: boolean;
  pagos: boolean;
  agendas: boolean;
  llamadas: boolean;
  fechaConsulta: string;
  asesorPostVenta: string;
  correoAsesorPostVenta: string;
  asesorComercial: string;
  correoAsesorComercial: string;
  validaCronograma: boolean;
  clientePorVision: string;
  clienteListaBlanca: string;
  clienteConSinPe: string;
}

export interface DeudorInfo {
  nombreRazonSocial: string;
  dniRuc: string;
  gradoInstruccion: string;
  edad: string;
  contacto: string;
  asesorPostVenta: string;
  asesorComercial: string;
  correoApv: string;
  correoAc: string;
}

export interface MejorRInfo {
  mejorResultado: string;
}