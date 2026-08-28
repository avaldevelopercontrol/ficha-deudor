import React from 'react';

import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';
import { ModalErrorSummary } from '../../../shared/components/modals/common/ModalErrorSummary';

import {
  MODAL_REGISTRAR_DIRECCION_LABELS,
  MODAL_REGISTRAR_DIRECCION_LAYOUT,
  MODAL_REGISTRAR_DIRECCION_LIMITS,
  MODAL_REGISTRAR_DIRECCION_PLACEHOLDERS,
  MODAL_REGISTRAR_DIRECCION_TEXTS,
} from '../constants/modalRegistrarDireccion.constants';
import { useModalRegistrarDireccion } from '../hooks/useModalRegistrarDireccion';
import type {
  DireccionFormData,
  DireccionReferenciada,
} from '../types/direccion.types';
import { DireccionFormFields } from './DireccionFormFields';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  direccionesExistentes: readonly DireccionReferenciada[];
  onRegistrar?: (data: DireccionFormData) => Promise<void> | void;
}

const ModalRegistrarDireccion: React.FC<Props> = ({
  isOpen,
  onClose,
  direccionesExistentes,
  onRegistrar,
}) => {
  const {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
    handleDepartamentoChange,
    handleProvinciaChange,
    departamentos,
    provincias,
    distritos,
    refUbicacionOptions,
    refUbicacionValue,
    isLoadingDepartamentos,
    isLoadingProvincias,
    isLoadingDistritos,
    isLoadingUbicaciones,
    errorDepartamentos,
    errorUbicaciones,
  } = useModalRegistrarDireccion({
    direccionesExistentes,
    onClose,
    onRegistrar,
  });

  if (!isOpen) return null;

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={MODAL_REGISTRAR_DIRECCION_TEXTS.title}
      onClose={handleCancel}
      submitLabel={MODAL_REGISTRAR_DIRECCION_TEXTS.submitLabel}
      onSubmit={handleSubmit}
      minHeight={MODAL_REGISTRAR_DIRECCION_LAYOUT.minHeight}
      isSubmitting={isSubmitting}
      submitError={submitError}
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
