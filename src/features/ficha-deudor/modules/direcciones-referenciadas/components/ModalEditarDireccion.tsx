import React from 'react';

import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';
import { ModalErrorSummary } from '../../../shared/components/modals/common/ModalErrorSummary';

import { estadosDireccionOptions } from '../constants/catalogosDireccion.constants';
import {
  MODAL_EDITAR_DIRECCION_LABELS,
  MODAL_EDITAR_DIRECCION_LAYOUT,
  MODAL_EDITAR_DIRECCION_PLACEHOLDERS,
  MODAL_EDITAR_DIRECCION_TEXTS,
} from '../constants/modalEditarDireccion.constants';
import { useModalEditarDireccion } from '../hooks/useModalEditarDireccion';
import type {
  DireccionEditFormData,
  DireccionReferenciada,
} from '../types/direccion.types';
import { DireccionFormFields } from './DireccionFormFields';
import { ModalEditarDireccionStatus } from './ModalEditarDireccionStatus';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  direccionId: string | null;
  direccionesExistentes: readonly DireccionReferenciada[];
  onGuardar?: (data: DireccionEditFormData) => Promise<void> | void;
}

const ModalEditarDireccion: React.FC<Props> = ({
  isOpen,
  onClose,
  direccionId,
  direccionesExistentes,
  onGuardar,
}) => {
  const {
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
  } = useModalEditarDireccion({
    isOpen,
    direccionId,
    direccionesExistentes,
    onClose,
    onGuardar,
  });

  if (!isOpen || !direccionId) {
    return null;
  }

  if (isLoadingDireccion) {
    return (
      <ModalEditarDireccionStatus
        isOpen={isOpen}
        onClose={handleCancel}
        variant="loading"
      >
        {MODAL_EDITAR_DIRECCION_TEXTS.loadingDireccion}
      </ModalEditarDireccionStatus>
    );
  }

  if (errorDireccion) {
    return (
      <ModalEditarDireccionStatus
        isOpen={isOpen}
        onClose={handleCancel}
        variant="error"
      >
        {MODAL_EDITAR_DIRECCION_TEXTS.errorDireccionPrefix}{' '}
        {errorDireccion}
      </ModalEditarDireccionStatus>
    );
  }

  if (!direccionData) {
    return (
      <ModalEditarDireccionStatus
        isOpen={isOpen}
        onClose={handleCancel}
        variant="error"
      >
        {MODAL_EDITAR_DIRECCION_TEXTS.emptyDireccion}
      </ModalEditarDireccionStatus>
    );
  }

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={MODAL_EDITAR_DIRECCION_TEXTS.title}
      onClose={handleCancel}
      submitLabel={MODAL_EDITAR_DIRECCION_TEXTS.submitLabel}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
      minHeight={MODAL_EDITAR_DIRECCION_LAYOUT.minHeight}
    >
      <DireccionFormFields
        form={form}
        errors={errors}
        onChange={handleChange}
        onDepartamentoChange={handleDepartamentoChange}
        onProvinciaChange={handleProvinciaChange}
        onEstadoChange={handleEstadoChange}
        labels={MODAL_EDITAR_DIRECCION_LABELS}
        placeholders={MODAL_EDITAR_DIRECCION_PLACEHOLDERS}
        layout={MODAL_EDITAR_DIRECCION_LAYOUT}
        departamentos={departamentos}
        provincias={provincias}
        distritos={distritos}
        refUbicacionOptions={refUbicacionOptions}
        refUbicacionValue={form.refUbicacion}
        isLoadingDepartamentos={isLoadingDepartamentos}
        isLoadingProvincias={isLoadingProvincias}
        isLoadingDistritos={isLoadingDistritos}
        isLoadingUbicaciones={isLoadingUbicaciones}
        errorDepartamentos={errorDepartamentos}
        errorUbicaciones={errorUbicaciones}
        showEstado
        estadosOptions={estadosDireccionOptions}
      />

      <ModalErrorSummary
        errors={errors}
        title={MODAL_EDITAR_DIRECCION_TEXTS.validationSummary}
      />
    </ModalFormLayout>
  );
};

export default ModalEditarDireccion;
