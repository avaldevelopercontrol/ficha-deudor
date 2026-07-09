export interface TelefonoReferenciadoApi {
  nId_PersTelef: number;
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

export interface TelefonoEditarApi {
  nId_PersTelef: number;
  av_PersDeudor: {
    nId_PersDeudor: number;
  };
  nTelef_Pre: string;
  nTelef_Nro: string;
  nTelef_Anexo: string;
  nId_PersRefUbi: number;
  cTelef_Coment: string;
  bEstado: boolean;
  nId_PersDirecc: number;
  nTelef_Prioridad: number;
  nId_PersTelefOpe: number;
  nId_PersDeudorGestionHrs: number;
  dFecUlt_PerstelefOpe: string;
  dFecCarga_PersTelef: string;
  cDireccionTEMPORAL: string;
  ncontactados: number;
  baseTelef: string;
  cbus: string;
  nId_Fuente: number;
  nreferencia: number;
  nid_usuarioupd: number;
  nId_OperadorTelefonico: number;
  nId_EstadoAstkProv: number;
  dFec_EstadoAstkProv: string;
  nId_TipoTelefono: number;
  nNoContactados: number;
  nCant_Ivr: number;
  nOrden_Act: number;
  bReclamo: boolean;
  c_osiptel: string;
  c_modalidad_osiptel: string;
  c_operadora_osiptel: string;
  f_estado_osiptel: string;
  nombre: string;
  contacto: string;
  parentesco: string;
}

export interface TelefonoReferenciado {
  id: number;               // ← Se genera en el mapeo desde nroTelefono
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
  referencia: number;
  reclamoIndecopi: boolean;
}

export interface TelefonoFormData {
  id: number;
  numero: string;
  anexo: string;
  resultado: string;
  operadorTelefonico: string;
  ubicacion: string;
  prioridad: string;
  horarioGestion: string;
  comentario: string;
  fuenteBusqueda: string;
  referencia: number;
  reclamoIndecopi: boolean;
  bEstado: boolean;
  dFecCarga_PersTelef: string;
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

export interface CreateTelefonoRequest {
  nId_PersTelef?: number;
  nId_PersDeudor: number;
  nTelef_Pre: string;
  nTelef_Nro: string;
  nTelef_Anexo: string;
  nId_PersRefUbi: number;
  nTelef_Prioridad: number;
  cTelef_Coment: string;
  nId_PersDeudorGestionHrs: number;
  nId_PersTelefOpe: number;
  nId_Fuente: number;
  nreferencia: number;
  nid_usuarioupd: number;
  nId_OperadorTelefonico: number;
  bEstado: boolean;
  dFecUlt_PerstelefOpe: string;
  dFecCarga_PersTelef: string;
  bReclamo: boolean;
}

export interface CreateTelefonoResponse {
  nId_PersTelef: number;
  nId_PersDeudor: number;
  nTelef_Nro: string;
}