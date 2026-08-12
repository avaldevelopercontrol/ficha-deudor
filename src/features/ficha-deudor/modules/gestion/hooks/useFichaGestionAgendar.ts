import {
  useCallback,
  useState,
} from 'react';

import type { FichaDeudorGestionFormParams } from '../../../shared/types/fichaDeudor.types';
import type { PaletaRespuestaOption } from '../../../shared/utils/selectOptions.utils';
import { createAgenda } from '../api/fichaGestionApi';
import { FICHA_GESTION_MESSAGES } from '../constants/fichaGestionMessages.constants';
import { buildAgendaRequest } from '../services/fichaGestionAgendar.service';
import type {
  FichaGestionValidationErrors,
  GestionFormClaro,
  SetGestionField,
} from '../types/fichaGestion.types';
import { useAutoClearValidationErrors } from './useAutoClearValidationErrors';
import { useOperationFeedback } from '@shared/hooks/useOperationFeedback';
import { getErrorMessage } from '../../../shared/utils/getErrorMessage';
import { useAsyncMutation } from '../../../../../shared/hooks/useAsyncMutation';

interface UseFichaGestionAgendarParams {
  form: GestionFormClaro;
  setField: SetGestionField;
  params: FichaDeudorGestionFormParams;
  deudorNombre: string;
  carteraNombre: string;
  np1Options: PaletaRespuestaOption[];
  np2Options: PaletaRespuestaOption[];
}

export const useFichaGestionAgendar = ({
  form,
  setField,
  params,
  deudorNombre,
  carteraNombre,
  np1Options,
  np2Options,
}: UseFichaGestionAgendarParams) => {
  const [
    agendaValidationErrors,
    setAgendaValidationErrors,
  ] = useState<
    FichaGestionValidationErrors
  >({});

  const clearAgendaValidationErrors =
    useCallback(() => {
      setAgendaValidationErrors({});
    }, []);

  useAutoClearValidationErrors({
    errors: agendaValidationErrors,
    onClear: clearAgendaValidationErrors,
  });

  const {
    feedback: agendaFeedback,
    clearFeedback: handleCloseAgendaFeedback,
    showFeedback: showAgendaFeedback,
    showSuccess: showAgendaSuccess,
  } = useOperationFeedback();

  const {
    isPending: isScheduling,
    execute: executeSchedule,
  } = useAsyncMutation();

  const clearAgendaState =
    useCallback(() => {
      clearAgendaValidationErrors();
      handleCloseAgendaFeedback();
    }, [
      clearAgendaValidationErrors,
      handleCloseAgendaFeedback,
    ]);

  const handleAgendar =
    useCallback(async () => {
      handleCloseAgendaFeedback();

      let agendaRequest;

      try {
        agendaRequest =
          buildAgendaRequest({
            form,
            params,
            deudorNombre,
            carteraNombre,
            np1Options,
            np2Options,
          });
      } catch (error) {
        clearAgendaValidationErrors();

        showAgendaFeedback({
          variant: 'error',
          title:
            'No se pudo preparar la agenda',
          message:
            getErrorMessage(
              error,
              FICHA_GESTION_MESSAGES.AGENDA_ERROR
            )
        });

        return;
      }

      setAgendaValidationErrors(
        agendaRequest.validationErrors
      );

      if (!agendaRequest.isValid) {
        return;
      }

      const result = await executeSchedule(
        () => createAgenda(agendaRequest.payload)
      );

      if (result.status === 'skipped') {
        return;
      }

      if (result.status === 'error') {
        showAgendaFeedback({
          variant: 'error',
          title:
            'No se pudo registrar la agenda',
          message:
            getErrorMessage(
              result.error,
              FICHA_GESTION_MESSAGES.AGENDA_ERROR
            )
        });

        return;
      }

      /*
       * Se conserva el comportamiento que
       * anteriormente tenía el botón Agendar.
       */
      setField(
        'fechaGestion',
        form.fechaNuevaGestion
      );

      setField(
        'horaGestion',
        form.horaNuevaGestion
      );

      setAgendaValidationErrors({});

      showAgendaSuccess({
        entity: {
          label: 'Agenda',
          gender: 'feminine',
        },
        action: 'create',
        context: 'record',
        message:
          'La nueva gestión fue agendada correctamente.',
      });
    }, [
      carteraNombre,
      clearAgendaValidationErrors,
      deudorNombre,
      handleCloseAgendaFeedback,
      executeSchedule,
      form,
      np1Options,
      np2Options,
      params,
      setField,
      showAgendaFeedback,
      showAgendaSuccess,
    ]);

  return {
    agendaValidationErrors,
    agendaFeedback,
    isScheduling,
    handleCloseAgendaFeedback,
    clearAgendaState,
    handleAgendar,
  };
};