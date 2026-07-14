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
  GestionFeedback,
  GestionFormClaro,
  SetGestionField,
} from '../types/fichaGestion.types';
import { useAutoClearValidationErrors } from './useAutoClearValidationErrors';
import { useAutoClearFeedback } from './useAutoClearFeedback';

interface UseFichaGestionAgendarParams {
  form: GestionFormClaro;
  setField: SetGestionField;
  params: FichaDeudorGestionFormParams;
  deudorNombre: string;
  carteraNombre: string;
  np1Options: PaletaRespuestaOption[];
  np2Options: PaletaRespuestaOption[];
}

const getErrorMessage = (
  error: unknown
): string => {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return FICHA_GESTION_MESSAGES.AGENDA_ERROR;
};

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

  const [
    agendaFeedback,
    setAgendaFeedback,
  ] = useState<GestionFeedback | null>(
    null
  );

  const [
    isScheduling,
    setIsScheduling,
  ] = useState(false);

  const handleCloseAgendaFeedback =
    useCallback(() => {
      setAgendaFeedback(null);
    }, []);

  useAutoClearFeedback({
    feedback: agendaFeedback,
    onClear: handleCloseAgendaFeedback,
  });

  const clearAgendaState =
    useCallback(() => {
      clearAgendaValidationErrors();
      setAgendaFeedback(null);
    }, [clearAgendaValidationErrors]);

  const handleAgendar =
    useCallback(async () => {
      if (isScheduling) {
        return;
      }

      setAgendaFeedback(null);

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

        setAgendaFeedback({
          variant: 'error',
          title:
            'No se pudo preparar la agenda',
          message:
            getErrorMessage(error),
        });

        return;
      }

      setAgendaValidationErrors(
        agendaRequest.validationErrors
      );

      if (!agendaRequest.isValid) {
        return;
      }

      setIsScheduling(true);

      try {
        await createAgenda(
          agendaRequest.payload
        );

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

        setAgendaFeedback({
          variant: 'success',
          title: 'Agenda registrada correctamente',
          message:
            'La nueva gestión fue agendada correctamente.',
        });
      } catch (error) {
        setAgendaFeedback({
          variant: 'error',
          title:
            'No se pudo registrar la agenda',
          message:
            getErrorMessage(error),
        });
      } finally {
        setIsScheduling(false);
      }
    }, [
      carteraNombre,
      clearAgendaValidationErrors,
      deudorNombre,
      form,
      isScheduling,
      np1Options,
      np2Options,
      params,
      setField,
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