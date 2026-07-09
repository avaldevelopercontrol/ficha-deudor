import type { FeedbackMessageVariant } from '@shared/components/ui';
import type { SelectOption } from '@shared/types';
import type { PaletaRespuestaOption } from '../../../shared/utils/selectOptions.utils';
import type { GestionForm } from '../../../shared/types/gestion.types';

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
  nId_TipoContacto?: number | null;
}

export interface GestionPaletaRespuestaList {
  id: string;
  nombre: string;
  idTipoContacto?: number | null;
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

export type GestionFormClaro = GestionForm & {
  estadoGestionClaro: string;
  motivoNoPago: string;
};

export type SetGestionField = <K extends keyof GestionFormClaro>(
  field: K,
  value: GestionFormClaro[K]
) => void;

export type SetGestionFields = (fields: Partial<GestionFormClaro>) => void;

export interface GestionFeedback {
  variant: FeedbackMessageVariant;
  title: string;
  message: string;
}

export type FichaGestionValidationErrors = Partial<
  Record<keyof GestionFormClaro | 'montoCompromiso' | 'documentos', string>
>;

export interface FichaGestionDatosPrincipalesProps {
  idCliente: string;
  form: GestionFormClaro;
  setField: SetGestionField;
  handleNP0Change: (value: string) => void;
  handleNP1Change: (value: string) => void;
  handleOpenWhatsApp: () => void;
  estadosOptions: SelectOption[];
  isLoadingEstados: boolean;
  errorEstados?: string | null;
  tiposOptions: SelectOption[];
  isLoadingTipos: boolean;
  errorTipos?: string | null;
  np0Options: PaletaRespuestaOption[];
  isLoadingNP0: boolean;
  errorNP0?: string | null;
  np1Options: PaletaRespuestaOption[];
  isLoadingNP1: boolean;
  errorNP1?: string | null;
  np2Options: PaletaRespuestaOption[];
  isLoadingNP2: boolean;
  errorNP2?: string | null;
}

export interface FichaGestionAccionesTomarProps {
  form: GestionFormClaro;
  setField: SetGestionField;
  setFields: SetGestionFields;
  usuarioActual: string;
  handleAgendar: () => void;
}

export interface FichaGestionResultadosLlamadaProps {
  form: GestionFormClaro;
  setField: SetGestionField;
  validationErrors?: FichaGestionValidationErrors;
  feedback?: GestionFeedback | null;
  onCloseFeedback?: () => void;
  mostrarCamposClaro: boolean;
  estadoGestionClaroOptions: SelectOption[];
  isLoadingEstadoGestionClaro: boolean;
  errorEstadoGestionClaro?: string | null;
  motivoNoPagoOptions: SelectOption[];
  isLoadingMotivoNoPago: boolean;
  errorMotivoNoPago?: string | null;
  handleGuardar: () => void;
  isSaving?: boolean;
}

export interface FichaGestionCatalogos {
  estadosOptions: SelectOption[];
  isLoadingEstados: boolean;
  errorEstados: string | null;

  tiposOptions: SelectOption[];
  isLoadingTipos: boolean;
  errorTipos: string | null;

  np0Options: PaletaRespuestaOption[];
  isLoadingNP0: boolean;
  errorNP0: string | null;

  np1Options: PaletaRespuestaOption[];
  isLoadingNP1: boolean;
  errorNP1: string | null;

  np2Options: PaletaRespuestaOption[];
  isLoadingNP2: boolean;
  errorNP2: string | null;

  estadoGestionClaroOptions: SelectOption[];
  isLoadingEstadoGestionClaro: boolean;
  errorEstadoGestionClaro: string | null;

  motivoNoPagoOptions: SelectOption[];
  isLoadingMotivoNoPago: boolean;
  errorMotivoNoPago: string | null;
}

export interface FichaGestionViewModel {
  datosPrincipalesProps: FichaGestionDatosPrincipalesProps;
  accionesTomarProps: FichaGestionAccionesTomarProps;
  resultadosLlamadaProps: FichaGestionResultadosLlamadaProps;
}