import { useCallback } from 'react';

import { useModalForm } from '@shared/hooks/ui/useModalForm';

import { MODAL_REGISTRAR_TELEFONO_INITIAL_FORM } from '../constants/modalRegistrarTelefono.constants';
import type {
  TelefonoFormData,
  TelefonoReferenciado,
} from '../types/telefono.types';
import { validateTelefonoForm } from '../validations/telefonoValidations';
import { useTelefonoCatalogosForm } from './useTelefonoCatalogosForm';

interface UseModalRegistrarTelefonoParams {
  telefonosExistentes: readonly TelefonoReferenciado[];
  onClose: () => void;
  onRegistrar?: (data: TelefonoFormData) => Promise<void> | void;
}

export const useModalRegistrarTelefono = ({
  telefonosExistentes,
  onClose,
  onRegistrar,
}: UseModalRegistrarTelefonoParams) => {
  const validate = useCallback(
    (data: TelefonoFormData) =>
      validateTelefonoForm(data, telefonosExistentes),
    [telefonosExistentes]
  );

  const handleRegistrar = useCallback(
    (data: TelefonoFormData) => onRegistrar?.(data),
    [onRegistrar]
  );

  const {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useModalForm<TelefonoFormData>({
    initialForm: MODAL_REGISTRAR_TELEFONO_INITIAL_FORM,
    onClose,
    onSubmit: handleRegistrar,
    validate,
    resetOnClose: true,
  });

  const catalogos = useTelefonoCatalogosForm();

  return {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
    ...catalogos,
  };
};
