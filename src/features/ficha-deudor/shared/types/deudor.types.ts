export interface CabeceraInfoApi {
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
  dni: string;
  ruc: string;
  nombre: string;
  nombreCompleto: string;
  gradoInstruccion: string;
  edad: string;
  correo: string;
  asesorPostVenta: string;
  correoAsesorPostVenta: string;
  asesorComercial: string;
  correoAsesorComercial: string;
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
  clientePorVision: string;
  clienteListaBlanca: string;
  clienteConSinPe: string;
}