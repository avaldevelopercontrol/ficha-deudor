export interface TelefonoReferenciado {
  id: string;
  prioridad: number;
  numero: string;
  horario: string;
  refUbicacion: string;
  estado: string;
  fechaEstado: string;
  fechaBase: string;
  contactados: string;
  noContactados: number;
  ivr: string;
  fuente: string,
  ordenSearch: number;
  anexo: string;
  operadorTelefonico: string;
  referencia: string;
  reclamoIndecopi: string;
}

export interface TelefonoFormData {
  numero: string;
  anexo: string;
  resultado: string;
  operadorTelefonico: string;
  ubicacion: string;
  prioridad: string;
  horarioGestion: string;
  comentario: string;
  fuenteBusqueda: string;
  referencia: string;
  reclamoIndecopi: string;
}