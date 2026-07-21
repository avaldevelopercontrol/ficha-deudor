import {
  useCallback,
  useRef,
  useState,
} from 'react';

import type { DocumentoApi } from '../../../shared/types';
import type { FichaDeudorGestionFormParams } from '../../../shared/types/fichaDeudor.types';
import { createGestionOpeGesContratos } from '../api/fichaGestionApi';
import { FICHA_GESTION_MESSAGES } from '../constants/fichaGestionMessages.constants';
import { buildGestionSaveRequest } from '../services/fichaGestionGuardar.service';
import type {
  FichaGestionValidationErrors,
  GestionFormClaro,
} from '../types/fichaGestion.types';
import { useAutoClearValidationErrors } from './useAutoClearValidationErrors';
import { getCurrentPeruDateTime } from '../../../shared/utils/date.utils';
import { getErrorMessage } from '../../../shared/utils/getErrorMessage';

interface UseFichaGestionGuardarParams {
  form: GestionFormClaro;
  params: FichaDeudorGestionFormParams;
  documentosFiltrados: DocumentoApi[];
  np1TipoContacto: number;
  requiereCamposClaro: boolean;
  onGestionGuardada?: (gestionTerminada: boolean) => void;
  onError?: (message: string) => void;
  onSubmit?: (
    data: GestionFormClaro,
    fechaFinGestion: string
  ) => void;
}

export const useFichaGestionGuardar = ({
  form,
  params,
  documentosFiltrados,
  np1TipoContacto,
  requiereCamposClaro,
  onGestionGuardada,
  onError,
  onSubmit,
}: UseFichaGestionGuardarParams) => {
  const [
    validationErrors,
    setValidationErrors,
  ] = useState<FichaGestionValidationErrors>({});

  const [isSaving, setIsSaving] = useState(false);

  const isSavingRef = useRef(false);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  useAutoClearValidationErrors({
    errors: validationErrors,
    onClear: clearValidationErrors,
  });

  const handleGuardar =
    useCallback(async () => {
      if (isSavingRef.current) {
        return;
      }

      const fechaFinGestion =
        getCurrentPeruDateTime();

      const saveRequest =
        buildGestionSaveRequest({
          form,
          params,
          documentosFiltrados,
          np1TipoContacto,
          requiereCamposClaro,
          fechaFinGestion,
        });

      setValidationErrors(
        saveRequest.validationErrors
      );

      if (!saveRequest.isValid) {
        return;
      }

      isSavingRef.current = true;
      setIsSaving(true);

      let gestionGuardada = false;

      try {
        await createGestionOpeGesContratos(
          saveRequest.payload
        );

        gestionGuardada = true;
      } catch (error) {
        onError?.(
          getErrorMessage(
            error,
            FICHA_GESTION_MESSAGES.SAVE_ERROR
          )
        );
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }

      if (!gestionGuardada) {
        return;
      }

      onSubmit?.(
        form,
        fechaFinGestion
      );

      onGestionGuardada?.(
        form.gestionTerminada
      );
    }, [
      documentosFiltrados,
      form,
      np1TipoContacto,
      onError,
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