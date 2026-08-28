import { useCallback } from 'react';

import { useModalForm } from '@shared/hooks/ui/useModalForm';

import { MODAL_EDITAR_TELEFONO_INITIAL_FORM } from '../constants/modalEditarTelefono.constants';
import { mapTelefonoEditarApiToFormData } from '../mappers/modalEditarTelefono.mapper';
import type {
  TelefonoEditarApi,
  TelefonoFormData,
  TelefonoReferenciado,
} from '../types/telefono.types';
import { validateModalEditarTelefono } from '../validations/modalEditarTelefono.validation';
import { useTelefonoCatalogosForm } from './useTelefonoCatalogosForm';
import { useTelefonoById } from './useTelefonosReferenciados';

interface UseModalEditarTelefonoParams {
  isOpen: boolean;
  telefonoId: number | null;
  telefonosExistentes: readonly TelefonoReferenciado[];
  onClose: () => void;
  onGuardar?: (data: TelefonoFormData) => Promise<void> | void;
}

export const useModalEditarTelefono = ({
  isOpen,
  telefonoId,
  telefonosExistentes,
  onClose,
  onGuardar,
}: UseModalEditarTelefonoParams) => {
  const telefonoResourceId = isOpen ? telefonoId : null;

  const {
    data: telefonoData,
    isLoading: isLoadingTelefono,
    error: errorTelefono,
  } = useTelefonoById(telefonoResourceId);

  const validate = useCallback(
    (data: TelefonoFormData) =>
      validateModalEditarTelefono(
        data,
        telefonosExistentes,
        telefonoId
      ),
    [telefonosExistentes, telefonoId]
  );

  const handleGuardar = useCallback(
    (data: TelefonoFormData) => {
      if (telefonoId === null) {
        throw new Error(
          'No se encontró el teléfono seleccionado.'
        );
      }

      return onGuardar?.({
        ...data,
        id: telefonoId,
      });
    },
    [onGuardar, telefonoId]
  );

  const {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useModalForm<TelefonoFormData, TelefonoEditarApi>({
    initialForm: MODAL_EDITAR_TELEFONO_INITIAL_FORM,
    entity: telefonoData,
    mapEntityToForm: mapTelefonoEditarApiToFormData,
    onClose,
    onSubmit: handleGuardar,
    validate,
    resetOnClose: true,
  });

  const catalogos = useTelefonoCatalogosForm();

  return {
    telefonoData,
    isLoadingTelefono,
    errorTelefono,
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
