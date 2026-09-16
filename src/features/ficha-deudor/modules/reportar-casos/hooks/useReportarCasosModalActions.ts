import { useCallback, useState } from 'react';

import { useOperationFeedback } from '@shared/hooks/useOperationFeedback';

import {
  createReportarCaso,
  updateReportarCaso,
} from '../api/reportarCasosApi';
import { REPORTAR_CASOS_POPUP_TEXTS } from '../constants/reportarCasosPopup.constants';
import type {
  ReportarCaso,
  ReportarCasoByIdApi,
  ReportarCasoFormData,
} from '../types/reportarCaso.types';
import { getErrorMessage } from '../../../shared/utils/getErrorMessage';

interface UseReportarCasosModalActionsParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
  idUsuario: string;
  refetch: () => Promise<void>;
}

export const useReportarCasosModalActions = ({
  idCliente,
  idCartera,
  idDeudor,
  idUsuario,
  refetch,
}: UseReportarCasosModalActionsParams) => {
  const {
    feedback,
    clearFeedback,
    showSuccess,
  } = useOperationFeedback();

  const [showRegistrar, setShowRegistrar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [casoEditarId, setCasoEditarId] = useState<string | null>(null);

  const handleNuevo = useCallback(() => {
    clearFeedback();
    setShowRegistrar(true);
  }, [clearFeedback]);

  const handleCloseRegistrar = useCallback(() => {
    setShowRegistrar(false);
  }, []);

  const handleEdit = useCallback(
    (row: ReportarCaso) => {
      clearFeedback();
      setCasoEditarId(row.id);
      setShowEditar(true);
    },
    [clearFeedback]
  );

  const handleCloseEditar = useCallback(() => {
    setShowEditar(false);
    setCasoEditarId(null);
  }, []);

  const handleRegistrar = useCallback(
    async (data: ReportarCasoFormData): Promise<void> => {
      clearFeedback();

      try {
        await createReportarCaso({
          idCliente,
          idCartera,
          idDeudor,
          idUsuario,
          data,
        });

        await refetch();

        showSuccess({
          entity: {
            label: 'Caso',
            gender: 'masculine',
          },
          action: 'create',
        });
      } catch (error) {
        throw new Error(
          getErrorMessage(
            error,
            REPORTAR_CASOS_POPUP_TEXTS.registerError
          )
        );
      }
    },
    [
      clearFeedback,
      idCartera,
      idCliente,
      idDeudor,
      idUsuario,
      refetch,
      showSuccess,
    ]
  );


  const handleGuardarEdicion = useCallback(
    async (
      data: ReportarCasoFormData,
      original: ReportarCasoByIdApi
    ): Promise<void> => {
      clearFeedback();

      try {
        await updateReportarCaso({
          idCliente,
          idCartera,
          idDeudor,
          idUsuario,
          original,
          data,
        });

        await refetch();

        showSuccess({
          entity: {
            label: 'Caso',
            gender: 'masculine',
          },
          action: 'update',
        });
      } catch (error) {
        throw new Error(
          getErrorMessage(
            error,
            REPORTAR_CASOS_POPUP_TEXTS.updateError
          )
        );
      }
    },
    [
      clearFeedback,
      idCartera,
      idCliente,
      idDeudor,
      idUsuario,
      refetch,
      showSuccess,
    ]
  );

  return {
    feedback,
    clearFeedback,
    showRegistrar,
    showEditar,
    casoEditarId,
    handleNuevo,
    handleEdit,
    handleCloseRegistrar,
    handleCloseEditar,
    handleRegistrar,
    handleGuardarEdicion,
  };
};
