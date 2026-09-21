export interface AdicionalMafGestionApi {
  ventanaMeses: number;
  canal: number;
  canalNombre: string;
  nId_DocxCobrarOpe: number;
  nId_DocxCobrar: number;
  fecha: string | null;
  estatus: string;
  peso: number;
  telefono: string | null;
  comentario: string | null;
  intentos: number;
  intentosRobot: number;
  contactosDirectos: number;
  origenDireccion: string | null;
  direccion: string | null;
}

export interface AdicionalMafOperacionApi {
  operacion: string;
  placa: string | null;
  diasAtraso: number;
  nId_Ubigeo: number;
  estadoOperacion: string | null;
  avanceCredito: string | null;
  direccionLegal: string | null;
  distritoLegal: string | null;
  provinciaLegal: string | null;
  departamentoLegal: string | null;
}

export interface AdicionalMafApi {
  numeroDiasNoContacto: number;
  fechaUltimoContacto: string | null;
  cantidadTotalVino: number;
  cantidadTotalPago: number;
  cantidadTotalVino6Meses: number;
  cantidadTotalPago6Meses: number;
  cobertura: string | null;
  mejoresGestiones: AdicionalMafGestionApi[];
  operaciones: AdicionalMafOperacionApi[];
}

export interface AdicionalMafGestion {
  ventanaMeses: number;
  canal: number;
  canalNombre: string;
  idDocxCobrarOpe: number;
  idDocxCobrar: number;
  fecha: string | null;
  estatus: string;
  peso: number;
  telefono: string | null;
  comentario: string | null;
  intentos: number;
  intentosRobot: number;
  contactosDirectos: number;
  origenDireccion: string | null;
  direccion: string | null;
}

export interface AdicionalMafOperacion {
  operacion: string;
  placa: string | null;
  diasAtraso: number;
  idUbigeo: number;
  estadoOperacion: string | null;
  avanceCredito: string | null;
  direccionLegal: string | null;
  distritoLegal: string | null;
  provinciaLegal: string | null;
  departamentoLegal: string | null;
}

export interface AdicionalMaf {
  numeroDiasNoContacto: number;
  fechaUltimoContacto: string | null;
  cantidadTotalVino: number;
  cantidadTotalPago: number;
  cantidadTotalVino6Meses: number;
  cantidadTotalPago6Meses: number;
  cobertura: string | null;
  mejoresGestiones: AdicionalMafGestion[];
  operaciones: AdicionalMafOperacion[];
}

export type AdicionalMafCanal = 'CALL' | 'CAMPO';
