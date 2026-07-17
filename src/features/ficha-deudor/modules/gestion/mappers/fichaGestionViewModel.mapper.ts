import type {
  FichaGestionCatalogos,
  FichaGestionTelefonoSearchProps,
  FichaGestionValidationErrors,
  FichaGestionViewModel,
  GestionFeedback,
  GestionFormClaro,
  SetGestionField,
  SetGestionFields,
} from '../types/fichaGestion.types';

interface BuildFichaGestionViewModelPropsParams {
  idCliente: string;

  form: GestionFormClaro;
  setField: SetGestionField;
  setFields: SetGestionFields;

  handleNP0Change: (
    value: string
  ) => void;

  handleNP1Change: (
    value: string
  ) => void;

  handleOpenWhatsApp: () => void;

  telefonoSearch: FichaGestionTelefonoSearchProps;

  catalogos: FichaGestionCatalogos;
  usuarioActual: string;

  handleAgendar: () => void | Promise<void>;

  agendaValidationErrors:
    FichaGestionValidationErrors;

  agendaFeedback:
    GestionFeedback | null;

  isScheduling: boolean;

  handleCloseAgendaFeedback:
    () => void;

  validationErrors:
    FichaGestionValidationErrors;

  feedback:
    GestionFeedback | null;

  handleCloseFeedback: () => void;

  mostrarCamposClaro: boolean;

  handleGuardarGestion:
    () => void | Promise<void>;

  isSaving: boolean;
}

export const buildFichaGestionViewModelProps = ({
  idCliente,

  form,
  setField,
  setFields,

  handleNP0Change,
  handleNP1Change,
  handleOpenWhatsApp,
  telefonoSearch,

  catalogos,
  usuarioActual,

  handleAgendar,
  agendaValidationErrors,
  agendaFeedback,
  isScheduling,
  handleCloseAgendaFeedback,

  validationErrors,
  feedback,
  handleCloseFeedback,

  mostrarCamposClaro,
  handleGuardarGestion,
  isSaving,
}: BuildFichaGestionViewModelPropsParams): FichaGestionViewModel => {
  const {
    estadosOptions,
    isLoadingEstados,
    errorEstados,

    tiposOptions,
    isLoadingTipos,
    errorTipos,

    np0Options,
    isLoadingNP0,
    errorNP0,

    np1Options,
    isLoadingNP1,
    errorNP1,

    np2Options,
    isLoadingNP2,
    errorNP2,

    estadoGestionClaroOptions,
    isLoadingEstadoGestionClaro,
    errorEstadoGestionClaro,

    motivoNoPagoOptions,
    isLoadingMotivoNoPago,
    errorMotivoNoPago,
  } = catalogos;

  return {
    datosPrincipalesProps: {
      idCliente,

      form,
      setField,

      handleNP0Change,
      handleNP1Change,
      handleOpenWhatsApp,
      telefonoSearch,

      estadosOptions,
      isLoadingEstados,
      errorEstados,

      tiposOptions,
      isLoadingTipos,
      errorTipos,

      np0Options,
      isLoadingNP0,
      errorNP0,

      np1Options,
      isLoadingNP1,
      errorNP1,

      np2Options,
      isLoadingNP2,
      errorNP2,
    },

    accionesTomarProps: {
      form,
      setField,
      setFields,
      usuarioActual,

      handleAgendar,
      agendaValidationErrors,
      agendaFeedback,

      onCloseAgendaFeedback:
        handleCloseAgendaFeedback,

      isScheduling,
    },

    resultadosLlamadaProps: {
      form,
      setField,

      validationErrors,
      feedback,

      onCloseFeedback:
        handleCloseFeedback,

      mostrarCamposClaro,

      estadoGestionClaroOptions,
      isLoadingEstadoGestionClaro,
      errorEstadoGestionClaro,

      motivoNoPagoOptions,
      isLoadingMotivoNoPago,
      errorMotivoNoPago,

      handleGuardar:
        handleGuardarGestion,

      isSaving,
    },
  };
};