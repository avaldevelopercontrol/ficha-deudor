export interface TelefonoReferenciadoApi {
  prioridad: number;
  nroTelefono: string;
  horario: string;
  referenciaUbicacion: string;
  estado: string;
  fechaEstado: string;
  fechaBase: string;
  contactados: string;
  noContactados: number;
  cantidadIvr: number;
  fuente: string;
  ordenSearch: string;
}

export interface TelefonoReferenciado {
  id: string;               // ← Se genera en el mapeo desde nroTelefono
  prioridad: number;
  numero: string;           // ← Mapeado desde nroTelefono
  horario: string;
  refUbicacion: string;     // ← Mapeado desde referenciaUbicacion
  estado: string;
  fechaEstado: string;
  fechaBase: string;
  contactados: string;
  noContactados: number;
  ivr: string;              // ← Mapeado desde cantidadIvr (number → string)
  fuente: string;
  ordenSearch: number;      // ← Mapeado desde ordenSearch (string → number)
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

export interface TelefonoList {
  id: string;
  nombre: string;
}

export interface TelefonoResultadoApi {
  nId_PersTelefOpe: number;
  cNombre_PersTelefOpe: string;
  cSigla_PersTelefOpe: string;
  bEstado: boolean;
}

export interface TelefonoOperadorApi {
  nId_OperadorTelefonico: number;
  cNombreOperadorTelef: string;
  cAbrevOperadorTelef: string;
  bEstado: boolean;
}

export interface TelefonoUbicacionApi {
  nId_PersRefUbi: number;
  cNombre_PersRefUbi: string;
  cSigla_PersRefUbi?: string;
  bEstado: boolean;
  nGestionMovil: number;
}

export interface TelefonoHorarioGestionApi {
  nId_PersDeudorGestionHrs: number;
  cNombren_PersDeudorGestionHrs: string;
  cSigla_PersDeudorGestionHrs: string;
  bEstado: boolean;
  nHr_ini: number;
  nHr_fin: number;
}

export interface TelefonoFuenteBusquedaApi {
  nId_Fuente: number;
  cDescripcion: string;
  nId_Cliente_Ref: number;
  nId_Referencia: string;
  cNombre_Referencia: string;
}