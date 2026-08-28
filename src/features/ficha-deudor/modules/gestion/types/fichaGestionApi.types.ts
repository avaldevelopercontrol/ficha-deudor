export interface GestionEstadoApi {
  nId_OpeCodCliOut: number;
  cNombre_OpeCodCliOut: string;
}

export interface GestionTipoApi {
  nId_TipoGestion: number;
  cNomTipoGestion: string;
}

export interface GestionPaletaRespuestaApi {
  nId_OpeCodCliOut: number;
  cNombre_OpeCodCliOut: string;
  nId_TipoContacto?: number | null;
}

export interface GestionEstadoClaroApi {
  nId_OpeCodCliOut: number;
  cNombre_OpeCodCliOut: string;
}

export interface GestionMotivoNoPagoApi {
  nId_MotivoNoPago: number;
  cNombreMotivoNoPago: string;
}

export interface CreateAgendaPayload {
  nid_agenda: number;
  dFechNuevaGestion: string;
  nid_PersDeudor: number;
  nombre: string;
  cartera: string;
  nid_Cartera: number;
  nid_Cliente: number;
  nid_UsuOpe: number;
  dFecRegistro: string;
  cUsr_Login: string;
  nId_TipoOpeCodCliOut: 1 | 2;
  cRespuestaOpe: string;
  nId_OpeCodCliOut: number;
}

export interface CreateAgendaResponse {
  nid_Cliente: number;
  nid_Cartera: number;
  nid_UsuOpe: number;
  nid_agenda: number;
  nid_PersDeudor: number;
}

export interface CreateGestionOpeGesContratosPayload {
  nId_DocxCobrarOpe: number;
  nId_Cliente: number;
  nId_Contrato: number;
  nId_Cartera: number;
  nId_DocxCobrars: string;
  nId_PersDeudor: number;
  nId_Usuario: number;
  cNOMBRECONTACTO: string;
  cCARGO: string;
  nNP0: number;
  nNP1: number;
  nNP2: number;
  nESTADOGESTION: number;
  cTELEFONO: string;
  nTIPOGESTION: number;
  nASIGNARGESTOR: number | null;
  dFECHACOMPROMISO: string | null;
  nMONTOSOLES: number;
  nMONTODOLARES: number;
  dFECHANUEVAGESTION: string | null;
  cHORANUEVAGESTION: string;
  cMINUTONUEVAGESTION: string;
  dFECHAGESTION: string;
  cHORAGESTION: string;
  cMINUTOGESTION: string;
  cOBSERVACION: string;
  cSISTEMA: string;
  nESTADOGESTIONCLARO: number;
  nMOTIVONOPAGO: number;
  dFechaInicioGestion: string;
  dFechaFinGestion: string;
  bEstado: boolean;
}

export interface CreateGestionOpeGesContratosResponse {
  nro: number;
  nId_DocxCobrarOpeGes: number;
  nId_DocxCobrarOpe: number;
  nId_Cliente: number;
  nId_Contrato: number;
  nId_Cartera: number;
  nId_DocxCobrar: number;
  nId_PersDeudor: number;
  nId_Usuario: number;
}
