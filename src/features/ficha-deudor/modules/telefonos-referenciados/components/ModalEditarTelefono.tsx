import React from 'react';

import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';
import { useModalForm } from '@shared/hooks/ui/useModalForm';
import { useTelefonoById } from '../hooks/useTelefonosReferenciados';
import { useTelefonoCatalogosForm } from '../hooks/useTelefonoCatalogosForm';
import type {
  TelefonoFormData,
  TelefonoEditarApi,
} from '../types/telefono.types';
import {
  MODAL_EDITAR_TELEFONO_INITIAL_FORM,
  MODAL_EDITAR_TELEFONO_LABELS,
  MODAL_EDITAR_TELEFONO_LAYOUT,
  MODAL_EDITAR_TELEFONO_LIMITS,
  MODAL_EDITAR_TELEFONO_PLACEHOLDERS,
  MODAL_EDITAR_TELEFONO_TEXTS,
} from '../constants/modalEditarTelefono.constants';
import { mapTelefonoEditarApiToFormData } from '../mappers/modalEditarTelefono.mapper';
import { validateModalEditarTelefono } from '../validations/modalEditarTelefono.validation';
import { ModalErrorSummary } from '../../../shared/components/modals/common/ModalErrorSummary';
import { ModalAsyncStatusLayout } from '../../../shared/components/modals/common/ModalAsyncStatusLayout';
import { TelefonoFormFields } from './TelefonoFormFields';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  telefonoId: number | null;
  onGuardar?: (data: TelefonoFormData) => void;
}

const ModalEditarTelefono: React.FC<Props> = ({
  isOpen,
  onClose,
  telefonoId,
  onGuardar,
}) => {
  const {
    data: telefonoApi,
    isLoading: isLoadingTelefono,
    error: errorTelefono,
  } = useTelefonoById(telefonoId);

  const {
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
  } = useTelefonoCatalogosForm();

  const telefonoEntity = telefonoApi as TelefonoEditarApi | null;

  const { form, errors, handleChange, handleSubmit, handleCancel } =
    useModalForm<TelefonoFormData, TelefonoEditarApi>({
      initialForm: MODAL_EDITAR_TELEFONO_INITIAL_FORM,
      entity: telefonoEntity,
      mapEntityToForm: mapTelefonoEditarApiToFormData,
      onClose,
      onSubmit: (data) => {
        onGuardar?.(data);
      },
      validate: validateModalEditarTelefono,
      resetOnClose: true,
    });

  if (!isOpen || !telefonoId) return null;

  if (isLoadingTelefono) {
    return (
      <ModalAsyncStatusLayout
        isOpen={isOpen}
        title={MODAL_EDITAR_TELEFONO_TEXTS.title}
        onClose={handleCancel}
        submitLabel={MODAL_EDITAR_TELEFONO_TEXTS.submitLabel}
        minHeight={MODAL_EDITAR_TELEFONO_LAYOUT.minHeight}
        variant="loading"
      >
        {MODAL_EDITAR_TELEFONO_TEXTS.loadingTelefono}
      </ModalAsyncStatusLayout>
    );
  }

  if (errorTelefono) {
    return (
      <ModalAsyncStatusLayout
        isOpen={isOpen}
        title={MODAL_EDITAR_TELEFONO_TEXTS.title}
        onClose={handleCancel}
        submitLabel={MODAL_EDITAR_TELEFONO_TEXTS.submitLabel}
        minHeight={MODAL_EDITAR_TELEFONO_LAYOUT.minHeight}
        variant="error"
      >
        {MODAL_EDITAR_TELEFONO_TEXTS.errorTelefonoPrefix}{' '}
        {String(errorTelefono)}
      </ModalAsyncStatusLayout>
    );
  }

  if (!telefonoEntity) {
    return (
      <ModalAsyncStatusLayout
        isOpen={isOpen}
        title={MODAL_EDITAR_TELEFONO_TEXTS.title}
        onClose={handleCancel}
        submitLabel={MODAL_EDITAR_TELEFONO_TEXTS.submitLabel}
        minHeight={MODAL_EDITAR_TELEFONO_LAYOUT.minHeight}
        variant="error"
      >
        {MODAL_EDITAR_TELEFONO_TEXTS.emptyTelefono}
      </ModalAsyncStatusLayout>
    );
  }

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={MODAL_EDITAR_TELEFONO_TEXTS.title}
      onClose={handleCancel}
      submitLabel={MODAL_EDITAR_TELEFONO_TEXTS.submitLabel}
      onSubmit={handleSubmit}
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