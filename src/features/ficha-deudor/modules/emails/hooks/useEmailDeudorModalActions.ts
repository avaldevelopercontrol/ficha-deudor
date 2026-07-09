import { useCallback, useState } from 'react';

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
  const [showRegistrar, setShowRegistrar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [emailEditarId, setEmailEditarId] = useState<string | null>(null);

  const handleNuevo = useCallback(() => {
    setShowRegistrar(true);
  }, []);

  const handleCloseRegistrar = useCallback(() => {
    setShowRegistrar(false);
  }, []);

  const handleEdit = useCallback((row: Email) => {
    setEmailEditarId(row.id);
    setShowEditar(true);
  }, []);

  const handleCloseEditar = useCallback(() => {
    setShowEditar(false);
    setEmailEditarId(null);
  }, []);

  const handleRegistrar = useCallback(
    async (formData: EmailFormData): Promise<void> => {
      if (!idCliente || !idDeudor || !idUsuario) {
        throw new Error(EMAIL_DEUDOR_POPUP_TEXTS.missingRegisterParams);
      }

      try {
        await createEmail(idCliente, idDeudor, idUsuario, formData);
        refetch();
      } catch (err) {
        throw new Error(
          getErrorMessage(err, EMAIL_DEUDOR_POPUP_TEXTS.registerError)
        );
      }
    },
    [idCliente, idDeudor, idUsuario, refetch]
  );

  const handleGuardarEdicion = useCallback(
    async (formData: EmailEditFormData): Promise<void> => {
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
      } catch (err) {
        throw new Error(
          getErrorMessage(err, EMAIL_DEUDOR_POPUP_TEXTS.updateError)
        );
      }
    },
    [emailEditarId, idCliente, idDeudor, idUsuario, refetch]
  );

  return {
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