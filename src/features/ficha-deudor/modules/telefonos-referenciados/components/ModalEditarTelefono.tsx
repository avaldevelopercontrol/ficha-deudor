import React from 'react';

import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';
import { ModalErrorSummary } from '../../../shared/components/modals/common/ModalErrorSummary';

import {
  MODAL_EDITAR_TELEFONO_LABELS,
  MODAL_EDITAR_TELEFONO_LAYOUT,
  MODAL_EDITAR_TELEFONO_LIMITS,
  MODAL_EDITAR_TELEFONO_PLACEHOLDERS,
  MODAL_EDITAR_TELEFONO_TEXTS,
} from '../constants/modalEditarTelefono.constants';
import { useModalEditarTelefono } from '../hooks/useModalEditarTelefono';
import type {
  TelefonoFormData,
  TelefonoReferenciado,
} from '../types/telefono.types';
import { TelefonoFormFields } from './TelefonoFormFields';
import { ModalEditarTelefonoStatus } from './ModalEditarTelefonoStatus';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  telefonoId: number | null;
  telefonosExistentes: readonly TelefonoReferenciado[];
  onGuardar?: (data: TelefonoFormData) => Promise<void> | void;
}

const ModalEditarTelefono: React.FC<Props> = ({
  isOpen,
  onClose,
  telefonoId,
  telefonosExistentes,
  onGuardar,
}) => {
  const {
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
    resultadosOptions,
    operadoresOptions,
    ubicacionesOptions,
    horariosGestionOptions,
    fuentesBusquedaOptions,
    isLoadingResultados,
    isLoadingOperadores,
    isLoadingUbicaciones,
    isLoadingHorarios,
    isLoadingFuentes,
    errorResultados,
    errorOperadores,
    errorUbicaciones,
    errorHorarios,
    errorFuentes,
  } = useModalEditarTelefono({
    isOpen,
    telefonoId,
    telefonosExistentes,
    onClose,
    onGuardar,
  });

  if (!isOpen || telefonoId === null) {
    return null;
  }

  if (isLoadingTelefono) {
    return (
      <ModalEditarTelefonoStatus
        isOpen={isOpen}
        onClose={handleCancel}
        variant="loading"
      >
        {MODAL_EDITAR_TELEFONO_TEXTS.loadingTelefono}
      </ModalEditarTelefonoStatus>
    );
  }

  if (errorTelefono) {
    return (
      <ModalEditarTelefonoStatus
        isOpen={isOpen}
        onClose={handleCancel}
        variant="error"
      >
        {MODAL_EDITAR_TELEFONO_TEXTS.errorTelefonoPrefix}{' '}
        {errorTelefono}
      </ModalEditarTelefonoStatus>
    );
  }

  if (!telefonoData) {
    return (
      <ModalEditarTelefonoStatus
        isOpen={isOpen}
        onClose={handleCancel}
        variant="error"
      >
        {MODAL_EDITAR_TELEFONO_TEXTS.emptyTelefono}
      </ModalEditarTelefonoStatus>
    );
  }

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={MODAL_EDITAR_TELEFONO_TEXTS.title}
      onClose={handleCancel}
      submitLabel={MODAL_EDITAR_TELEFONO_TEXTS.submitLabel}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
      minHeight={MODAL_EDITAR_TELEFONO_LAYOUT.minHeight}
    >
      <TelefonoFormFields
        form={form}
        errors={errors}
        onChange={handleChange}
        labels={MODAL_EDITAR_TELEFONO_LABELS}
        placeholders={MODAL_EDITAR_TELEFONO_PLACEHOLDERS}
        limits={MODAL_EDITAR_TELEFONO_LIMITS}
        layout={MODAL_EDITAR_TELEFONO_LAYOUT}
        resultadosOptions={resultadosOptions}
        operadoresOptions={operadoresOptions}
        ubicacionesOptions={ubicacionesOptions}
        horariosGestionOptions={horariosGestionOptions}
        fuentesBusquedaOptions={fuentesBusquedaOptions}
        isLoadingResultados={isLoadingResultados}
        isLoadingOperadores={isLoadingOperadores}
        isLoadingUbicaciones={isLoadingUbicaciones}
        isLoadingHorarios={isLoadingHorarios}
        isLoadingFuentes={isLoadingFuentes}
        errorResultados={errorResultados}
        errorOperadores={errorOperadores}
        errorUbicaciones={errorUbicaciones}
        errorHorarios={errorHorarios}
        errorFuentes={errorFuentes}
        requireAdvancedFields
      />

      <ModalErrorSummary
        errors={errors}
        title={MODAL_EDITAR_TELEFONO_TEXTS.validationSummary}
      />
    </ModalFormLayout>
  );
};

export default ModalEditarTelefono;
