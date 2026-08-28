import { useCallback } from 'react';

import { useModalForm } from '@shared/hooks/ui/useModalForm';
import { toStringValue } from '@shared/utils/formValueMappers';

import { MODAL_REGISTRAR_DIRECCION_INITIAL_FORM } from '../constants/modalRegistrarDireccion.constants';
import type {
  DireccionFormData,
  DireccionReferenciada,
} from '../types/direccion.types';
import { validateDireccionForm } from '../validations/direccionValidations';
import { useDireccionCascadeFields } from './useDireccionCascadeFields';
import { useDireccionCatalogosForm } from './useDireccionCatalogosForm';

interface UseModalRegistrarDireccionParams {
  direccionesExistentes: readonly DireccionReferenciada[];
  onClose: () => void;
  onRegistrar?: (data: DireccionFormData) => Promise<void> | void;
}

export const useModalRegistrarDireccion = ({
  direccionesExistentes,
  onClose,
  onRegistrar,
}: UseModalRegistrarDireccionParams) => {
  const validate = useCallback(
    (data: DireccionFormData) =>
      validateDireccionForm(data, direccionesExistentes),
    [direccionesExistentes]
  );

  const handleRegistrar = useCallback(
    (data: DireccionFormData) => onRegistrar?.(data),
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
  } = useModalForm<DireccionFormData>({
    initialForm: MODAL_REGISTRAR_DIRECCION_INITIAL_FORM,
    onClose,
    onSubmit: handleRegistrar,
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

  const refUbicacionValue = toStringValue(
    form.refUbicacion || catalogos.refUbicacionOptions[0]?.id
  );

  return {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
    handleDepartamentoChange,
    handleProvinciaChange,
    refUbicacionValue,
    ...catalogos,
  };
};
