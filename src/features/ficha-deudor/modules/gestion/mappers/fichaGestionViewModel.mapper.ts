import type {
  FichaGestionCatalogos,
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
  handleNP0Change: (value: string) => void;
  handleNP1Change: (value: string) => void;
  handleOpenWhatsApp: () => void;
  catalogos: FichaGestionCatalogos;
  usuarioActual: string;
  handleAgendar: () => void;
  validationErrors: FichaGestionValidationErrors;
  feedback: GestionFeedback | null;
  handleCloseFeedback: () => void;
  mostrarCamposClaro: boolean;
  handleGuardarGestion: () => void | Promise<void>;
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
  catalogos,
  usuarioActual,
  handleAgendar,
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
    },

    resultadosLlamadaProps: {
      form,
      setField,
      validationErrors,
      feedback,
      onCloseFeedback: handleCloseFeedback,
      mostrarCamposClaro,
      estadoGestionClaroOptions,
      isLoadingEstadoGestionClaro,
      errorEstadoGestionClaro,
      motivoNoPagoOptions,
      isLoadingMotivoNoPago,
      errorMotivoNoPago,
      handleGuardar: handleGuardarGestion,
      isSaving,
    },
  };
};