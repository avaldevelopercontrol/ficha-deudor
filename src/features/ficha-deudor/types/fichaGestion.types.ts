// ─── GESTIÓN: Estado de Gestión ───
export interface GestionEstadoApi {
  nId_OpeCodCliOut: number;
  cNombre_OpeCodCliOut: string;
}

export interface GestionEstadoList {
  id: string;
  nombre: string;
}

// ─── GESTIÓN: Tipo de Gestión ───
export interface GestionTipoApi {
  nId_TipoGestion: number;
  cNomTipoGestion: string;
}

export interface GestionTipoList {
  id: string;
  nombre: string;
}

// ─── GESTIÓN: Paleta de Respuesta NP0 / NP1 / NP2 ───
export interface GestionPaletaRespuestaApi {
  nId_OpeCodCliOut: number;
  cNombre_OpeCodCliOut: string;
}

export interface GestionPaletaRespuestaList {
  id: string;
  nombre: string;
}

export interface GestionPaletaRespuestaParams {
  idCliente: string;
  idContrato: string;
  nivelPaleta: number;
  idSupOpeCodCliOut: string | number;
  idTipoGestion?: string | number;
}

// ─── GESTIÓN CLARO: Estado Gestión Claro ───
export interface GestionEstadoClaroApi {
  nId_OpeCodCliOut: number;
  cNombre_OpeCodCliOut: string;
}

export interface GestionEstadoClaroList {
  id: string;
  nombre: string;
}

// ─── GESTIÓN CLARO: Motivo No Pago ───
export interface GestionMotivoNoPagoApi {
  nId_MotivoNoPago: number;
  cNombreMotivoNoPago: string;
}

export interface GestionMotivoNoPagoList {
  id: string;
  nombre: string;
}