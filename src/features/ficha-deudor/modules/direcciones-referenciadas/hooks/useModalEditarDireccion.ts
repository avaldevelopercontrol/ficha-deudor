import { useCallback } from 'react';

import { useModalForm } from '@shared/hooks/ui/useModalForm';

import { MODAL_EDITAR_DIRECCION_INITIAL_FORM } from '../constants/modalEditarDireccion.constants';
import { mapDireccionByIdApiToEditFormData } from '../mappers/modalEditarDireccion.mapper';
import type {
  DireccionByIdApi,
  DireccionEditFormData,
  DireccionReferenciada,
} from '../types/direccion.types';
import { validateDireccionEditForm } from '../validations/direccionValidations';
import { useDireccionCascadeFields } from './useDireccionCascadeFields';
import { useDireccionCatalogosForm } from './useDireccionCatalogosForm';
import { useDireccionById } from './useDireccionesReferenciadas';

interface UseModalEditarDireccionParams {
  isOpen: boolean;
  direccionId: string | null;
  direccionesExistentes: readonly DireccionReferenciada[];
  onClose: () => void;
  onGuardar?: (data: DireccionEditFormData) => Promise<void> | void;
}

export const useModalEditarDireccion = ({
  isOpen,
  direccionId,
  direccionesExistentes,
  onClose,
  onGuardar,
}: UseModalEditarDireccionParams) => {
  const direccionResourceId = isOpen ? direccionId : null;

  const {
    data: direccionData,
    isLoading: isLoadingDireccion,
    error: errorDireccion,
  } = useDireccionById(direccionResourceId);

  const validate = useCallback(
    (data: DireccionEditFormData) =>
      validateDireccionEditForm(
        data,
        direccionesExistentes,
        direccionId
      ),
    [direccionesExistentes, direccionId]
  );

  const handleGuardar = useCallback(
    (data: DireccionEditFormData) => {
      if (!direccionId) {
        throw new Error(
          'No se encontró la dirección seleccionada.'
        );
      }

      return onGuardar?.({
        ...data,
        id: direccionId,
      });
    },
    [direccionId, onGuardar]
  );

  const {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useModalForm<
    DireccionEditFormData,
    DireccionByIdApi
  >({
    initialForm: MODAL_EDITAR_DIRECCION_INITIAL_FORM,
    entity: direccionData,
    mapEntityToForm: mapDireccionByIdApiToEditFormData,
    onClose,
    onSubmit: handleGuardar,
    validate,
    resetOnClose: true,
  });

  const {
    handleDepartamentoChange,
    handleProvinciaChange,
  } = useDireccionCascadeFields({
    handleChange,
  });

  const catalogos = useDireccionCatalogosForm(
    form.departamento || null,
    form.provincia || null
  );

  const handleEstadoChange = useCallback(
    (value: boolean) => {
      handleChange('estado', value);
    },
    [handleChange]
  );

  return {
    direccionData,
    isLoadingDireccion,
    errorDireccion,
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
    handleDepartamentoChange,
    handleProvinciaChange,
    handleEstadoChange,
    ...catalogos,
  };
};
