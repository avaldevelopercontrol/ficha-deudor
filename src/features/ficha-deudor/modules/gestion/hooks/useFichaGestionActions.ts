import type {
  GestionFormClaro,
  SetGestionField,
} from '../types/fichaGestion.types';
import type {
  DocumentoApi,
  FichaDeudorGestionFormParams,
} from '../../../shared/types';
import type { PaletaRespuestaOption } from '../../../shared/utils/selectOptions.utils';
import { useFichaGestionAgendar } from './useFichaGestionAgendar';
import { useFichaGestionGuardar } from './useFichaGestionGuardar';
import { useFichaGestionWhatsapp } from './useFichaGestionWhatsapp';

interface UseFichaGestionActionsParams {
  form: GestionFormClaro;
  setField: SetGestionField;
  params: FichaDeudorGestionFormParams;
  deudorNombre: string;
  carteraNombre: string;
  np1Options: PaletaRespuestaOption[];
  np2Options: PaletaRespuestaOption[];
  documentosFiltrados: DocumentoApi[];
  np1TipoContacto: number;
  requiereCamposClaro: boolean;
  onGestionGuardada?: (
    gestionTerminada: boolean
  ) => void;
  onSubmit?: (
    data: GestionFormClaro,
    fechaFinGestion: string
  ) => void;
}

export const useFichaGestionActions = ({
  form,
  setField,
  params,
  deudorNombre,
  carteraNombre,
  np1Options,
  np2Options,
  documentosFiltrados,
  np1TipoContacto,
  requiereCamposClaro,
  onGestionGuardada,
  onSubmit,
}: UseFichaGestionActionsParams) => {
  const {
    agendaValidationErrors,
    agendaFeedback,
    isScheduling,
    handleCloseAgendaFeedback,
    clearAgendaState,
    handleAgendar,
  } = useFichaGestionAgendar({
    form,
    setField,
    params,
    deudorNombre,
    carteraNombre,
    np1Options,
    np2Options,
  });

  const { handleOpenWhatsApp } =
    useFichaGestionWhatsapp({
      telefono: form.telefono,
    });

  const {
    validationErrors,
    isSaving,
    handleGuardar,
  } = useFichaGestionGuardar({
    form,
    params,
    documentosFiltrados,
    np1TipoContacto,
    requiereCamposClaro,
    onGestionGuardada,
    onSubmit,
  });

  return {
    agendaValidationErrors,
    agendaFeedback,
    isScheduling,
    handleCloseAgendaFeedback,
    clearAgendaState,
    validationErrors,
    isSaving,
    handleAgendar,
    handleOpenWhatsApp,
    handleGuardar,
  };
};