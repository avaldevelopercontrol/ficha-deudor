import type { FeedbackMessageVariant } from '../../../shared/components/ui';
import type { SelectOption } from '../../../shared/types';
import type { GestionForm } from './gestion.types';

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
  np0Options: SelectOption[];
  isLoadingNP0: boolean;
  errorNP0?: string | null;
  np1Options: SelectOption[];
  isLoadingNP1: boolean;
  errorNP1?: string | null;
  np2Options: SelectOption[];
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

export interface FichaGestionViewModel {
  datosPrincipalesProps: FichaGestionDatosPrincipalesProps;
  accionesTomarProps: FichaGestionAccionesTomarProps;
  resultadosLlamadaProps: FichaGestionResultadosLlamadaProps;
}