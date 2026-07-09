import type {
  GestionFormClaro,
  SetGestionField,
} from '../types/fichaGestion.types';
import type { DocumentoApi, FichaDeudorGestionFormParams } from '../../../shared/types';
import { useFichaGestionAgendar } from './useFichaGestionAgendar';
import { useFichaGestionGuardar } from './useFichaGestionGuardar';
import { useFichaGestionWhatsapp } from './useFichaGestionWhatsapp';

interface UseFichaGestionActionsParams {
  form: GestionFormClaro;
  setField: SetGestionField;
  usuarioActual: string;
  params: FichaDeudorGestionFormParams;
  documentosFiltrados: DocumentoApi[];
  np1TipoContacto: number;
  requiereCamposClaro: boolean;
  onGestionGuardada?: (gestionTerminada: boolean) => void;
  onSubmit?: (data: GestionFormClaro) => void;
}

export const useFichaGestionActions = ({
  form,
  setField,
  usuarioActual,
  params,
  documentosFiltrados,
  np1TipoContacto,
  requiereCamposClaro,
  onGestionGuardada,
  onSubmit,
}: UseFichaGestionActionsParams) => {

  const { handleAgendar } = useFichaGestionAgendar({
    form,
    setField,
    usuarioActual,
  });

  const { handleOpenWhatsApp } = useFichaGestionWhatsapp({
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
    validationErrors,
    isSaving,
    handleAgendar,
    handleOpenWhatsApp,
    handleGuardar,
  };
};