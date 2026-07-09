import React from 'react';

import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';

import { useModalForm } from '@shared/hooks/ui/useModalForm';

import type { DireccionFormData } from '../types/direccion.types';

import { toStringValue } from '@shared/utils/formValueMappers';

import { useDireccionCatalogosForm } from '../hooks/useDireccionCatalogosForm';
import { useDireccionCascadeFields } from '../hooks/useDireccionCascadeFields';

import { validateDireccionForm } from '../validations/direccionValidations';
import {
  MODAL_REGISTRAR_DIRECCION_INITIAL_FORM,
  MODAL_REGISTRAR_DIRECCION_LABELS,
  MODAL_REGISTRAR_DIRECCION_LAYOUT,
  MODAL_REGISTRAR_DIRECCION_LIMITS,
  MODAL_REGISTRAR_DIRECCION_PLACEHOLDERS,
  MODAL_REGISTRAR_DIRECCION_TEXTS,
} from '../constants/modalRegistrarDireccion.constants';
import { ModalErrorSummary } from '../../../shared/components/modals/common/ModalErrorSummary';
import { DireccionFormFields } from './DireccionFormFields';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegistrar?: (data: DireccionFormData) => void;
}

const ModalRegistrarDireccion: React.FC<Props> = ({
  isOpen,
  onClose,
  onRegistrar,
}) => {
  const { form, errors, handleChange, handleSubmit, handleCancel } =
    useModalForm<DireccionFormData>({
      initialForm: MODAL_REGISTRAR_DIRECCION_INITIAL_FORM,
      onClose,
      onSubmit: (data) => {
        onRegistrar?.(data);
      },
      validate: validateDireccionForm,
      resetOnClose: true,
    });

  const {
    handleDepartamentoChange,
    handleProvinciaChange,
  } = useDireccionCascadeFields({
    handleChange,
  });

  const {
    departamentos,
    provincias,
    distritos,
    refUbicacionOptions,
    isLoadingDepartamentos,
    isLoadingProvincias,
    isLoadingDistritos,
    isLoadingUbicaciones,
    errorDepartamentos,
    errorUbicaciones,
  } = useDireccionCatalogosForm(
    form.departamento || null,
    form.provincia || null
  );

  const refUbicacionValue = toStringValue(
    form.refUbicacion || refUbicacionOptions[0]?.id
  );

  if (!isOpen) return null;

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={MODAL_REGISTRAR_DIRECCION_TEXTS.title}
      onClose={handleCancel}
      submitLabel={MODAL_REGISTRAR_DIRECCION_TEXTS.submitLabel}
      onSubmit={handleSubmit}
      minHeight={MODAL_REGISTRAR_DIRECCION_LAYOUT.minHeight}
    >
      <DireccionFormFields
        form={form}
        errors={errors}
        onChange={handleChange}
        onDepartamentoChange={handleDepartamentoChange}
        onProvinciaChange={handleProvinciaChange}
        labels={MODAL_REGISTRAR_DIRECCION_LABELS}
        placeholders={MODAL_REGISTRAR_DIRECCION_PLACEHOLDERS}
        limits={MODAL_REGISTRAR_DIRECCION_LIMITS}
        layout={MODAL_REGISTRAR_DIRECCION_LAYOUT}
        departamentos={departamentos}
        provincias={provincias}
        distritos={distritos}
        refUbicacionOptions={refUbicacionOptions}
        refUbicacionValue={refUbicacionValue}
        isLoadingDepartamentos={isLoadingDepartamentos}
        isLoadingProvincias={isLoadingProvincias}
        isLoadingDistritos={isLoadingDistritos}
        isLoadingUbicaciones={isLoadingUbicaciones}
        errorDepartamentos={errorDepartamentos}
        errorUbicaciones={errorUbicaciones}
      />

      <ModalErrorSummary
        errors={errors}
        title={MODAL_REGISTRAR_DIRECCION_TEXTS.validationSummary}
      />
    </ModalFormLayout>
  );
};

export default ModalRegistrarDireccion;