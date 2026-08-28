import type { SelectOption } from '@shared/types';

import type { FichaGestionDatosPrincipalesCatalogos } from './fichaGestionCatalogos.types';
import type {
  FichaGestionValidationErrors,
  GestionFeedback,
  GestionFormClaro,
  SetGestionField,
  SetGestionFields,
} from './fichaGestionForm.types';

export interface FichaGestionTelefonoSearchProps {
  isOpen: boolean;
  telefonoIngresado: string;
  validationErrors: FichaGestionValidationErrors;
  isSearchDisabled: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  handleTelefonoChange: (value: string) => void;
  handleValidate: () => void;
  handleClear: () => void;
}

export interface FichaGestionDatosPrincipalesProps {
  idCliente: string;
  form: GestionFormClaro;
  setField: SetGestionField;
  handleNP0Change: (value: string) => void;
  handleNP1Change: (value: string) => void;
  telefonoSearch: FichaGestionTelefonoSearchProps;
  catalogos: FichaGestionDatosPrincipalesCatalogos;
}

export interface FichaGestionAccionesTomarProps {
  form: GestionFormClaro;
  setField: SetGestionField;
  setFields: SetGestionFields;
  usuarioActual: string;
  handleAgendar: () => void;
  agendaValidationErrors?: FichaGestionValidationErrors;
  agendaFeedback?: GestionFeedback | null;
  onCloseAgendaFeedback?: () => void;
  isScheduling?: boolean;
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
