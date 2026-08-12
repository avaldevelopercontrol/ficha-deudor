import { useCallback, useState } from 'react';

import {
  useOperationFeedback,
} from '@shared/hooks/useOperationFeedback';

import { createEmail, updateEmail } from '../api/emailsApi';
import type {
  Email,
  EmailEditFormData,
  EmailFormData,
} from '../types/email.types';
import { EMAIL_DEUDOR_POPUP_TEXTS } from '../constants/emailDeudorPopup.constants';
import { getErrorMessage } from '../../../shared/utils/getErrorMessage';

interface UseEmailDeudorModalActionsParams {
  idCliente?: string;
  idDeudor?: string;
  idUsuario?: string;
  refetch: () => void;
}

export const useEmailDeudorModalActions = ({
  idCliente,
  idDeudor,
  idUsuario,
  refetch,
}: UseEmailDeudorModalActionsParams) => {
  const {
    feedback,
    clearFeedback,
    showSuccess,
  } = useOperationFeedback();
  const [showRegistrar, setShowRegistrar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [emailEditarId, setEmailEditarId] = useState<string | null>(null);

  const handleNuevo = useCallback(() => {
    clearFeedback();
    setShowRegistrar(true);
  }, [clearFeedback]);

  const handleCloseRegistrar = useCallback(() => {
    setShowRegistrar(false);
  }, []);

  const handleEdit = useCallback((row: Email) => {
    clearFeedback();
    setEmailEditarId(row.id);
    setShowEditar(true);
  }, [clearFeedback]);

  const handleCloseEditar = useCallback(() => {
    setShowEditar(false);
    setEmailEditarId(null);
  }, []);

  const handleRegistrar = useCallback(
    async (formData: EmailFormData): Promise<void> => {
      clearFeedback();

      if (!idCliente || !idDeudor || !idUsuario) {
        throw new Error(EMAIL_DEUDOR_POPUP_TEXTS.missingRegisterParams);
      }

      try {
        await createEmail(idCliente, idDeudor, idUsuario, formData);
        refetch();

        showSuccess({
          entity: {
            label: 'Email',
            gender: 'masculine',
          },
          action: 'create',
        });
      } catch (err) {
        throw new Error(
          getErrorMessage(err, EMAIL_DEUDOR_POPUP_TEXTS.registerError)
        );
      }
    },
    [
      clearFeedback,
      idCliente,
      idDeudor,
      idUsuario,
      refetch,
      showSuccess,
    ]
  );

  const handleGuardarEdicion = useCallback(
    async (formData: EmailEditFormData): Promise<void> => {
      clearFeedback();

      if (!idCliente || !idDeudor || !idUsuario) {
        throw new Error(EMAIL_DEUDOR_POPUP_TEXTS.missingEditParams);
      }

      if (!emailEditarId) {
        throw new Error(EMAIL_DEUDOR_POPUP_TEXTS.missingSelectedEmail);
      }

      try {
        await updateEmail(
          idCliente,
          idDeudor,
          idUsuario,
          emailEditarId,
          formData,
          formData.dFecRegistro
        );

        refetch();

        showSuccess({
          entity: {
            label: 'Email',
            gender: 'masculine',
          },
          action: 'update',
        });
      } catch (err) {
        throw new Error(
          getErrorMessage(err, EMAIL_DEUDOR_POPUP_TEXTS.updateError)
        );
      }
    },
    [
      clearFeedback,
      emailEditarId,
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
    emailEditarId,
    handleNuevo,
    handleEdit,
    handleCloseRegistrar,
    handleCloseEditar,
    handleRegistrar,
    handleGuardarEdicion,
  };
};