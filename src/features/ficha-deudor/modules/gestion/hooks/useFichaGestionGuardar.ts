import { useCallback, useState } from 'react';
import { FICHA_GESTION_MESSAGES } from '../constants/fichaGestionMessages.constants';
import { createGestionOpeGesContratos } from '../api/fichaGestionApi';
import type { FichaDeudorGestionFormParams } from '../../../shared/types/fichaDeudor.types';
import type {
  FichaGestionValidationErrors,
  GestionFormClaro,
} from '../types/fichaGestion.types';
import { buildGestionSaveRequest } from '../services/fichaGestionGuardar.service';
import type { DocumentoApi } from '../../../shared/types';

interface UseFichaGestionGuardarParams {
  form: GestionFormClaro;
  params: FichaDeudorGestionFormParams;
  documentosFiltrados: DocumentoApi[];
  np1TipoContacto: number;
  requiereCamposClaro: boolean;
  onGestionGuardada?: (gestionTerminada: boolean) => void;
  onSubmit?: (data: GestionFormClaro) => void;
}

export const useFichaGestionGuardar = ({
  form,
  params,
  documentosFiltrados,
  np1TipoContacto,
  requiereCamposClaro,
  onGestionGuardada,
  onSubmit,
}: UseFichaGestionGuardarParams) => {
  const [validationErrors, setValidationErrors] =
    useState<FichaGestionValidationErrors>({});

  const [isSaving, setIsSaving] = useState(false);

  const handleGuardar = useCallback(async () => {
    const saveRequest = buildGestionSaveRequest({
    form,
    params,
    documentosFiltrados,
    np1TipoContacto,
    requiereCamposClaro,
    });

    setValidationErrors(saveRequest.validationErrors);

    if (!saveRequest.isValid) return;

    setIsSaving(true);

    try {
      await createGestionOpeGesContratos(saveRequest.payload);

      onSubmit?.(form);
      onGestionGuardada?.(form.gestionTerminada);

      alert(FICHA_GESTION_MESSAGES.SAVE_SUCCESS);
    } catch (error) {
      console.error('Error al guardar gestión:', error);
      alert(FICHA_GESTION_MESSAGES.SAVE_ERROR);
    } finally {
      setIsSaving(false);
    }
  }, [
    documentosFiltrados,
    form,
    np1TipoContacto,
    onGestionGuardada,
    onSubmit,
    params,
    requiereCamposClaro,
  ]);

  return {
    validationErrors,
    isSaving,
    handleGuardar,
  };
};