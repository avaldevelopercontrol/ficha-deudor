import React from 'react';

import { useModalForm } from '@shared/hooks/ui/useModalForm';

import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';

import { ModalAsyncStatusLayout } from '../../../shared/components/modals/common/ModalAsyncStatusLayout';

import { ModalErrorSummary } from '../../../shared/components/modals/common/ModalErrorSummary';

import {
  useDireccionById,
} from '../hooks/useDireccionesReferenciadas';

import { useDireccionCatalogosForm } from '../hooks/useDireccionCatalogosForm';

import { useDireccionCascadeFields } from '../hooks/useDireccionCascadeFields';

import type {
  DireccionEditFormData,
  DireccionByIdApi,
} from '../types/direccion.types';

import { estadosDireccionOptions } from '../constants/catalogosDireccion.constants';

import { validateDireccionEditForm } from '../validations/direccionValidations';

import {
  MODAL_EDITAR_DIRECCION_INITIAL_FORM,
  MODAL_EDITAR_DIRECCION_LABELS,
  MODAL_EDITAR_DIRECCION_LAYOUT,
  MODAL_EDITAR_DIRECCION_PLACEHOLDERS,
  MODAL_EDITAR_DIRECCION_TEXTS,
} from '../constants/modalEditarDireccion.constants';

import { mapDireccionByIdApiToEditFormData } from '../mappers/modalEditarDireccion.mapper';

import { DireccionFormFields } from './DireccionFormFields';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  direccionId: string | null;

  onGuardar?: (
    data: DireccionEditFormData & {
      id: string;
    }
  ) => Promise<void> | void;
}

const ModalEditarDireccion: React.FC<Props> = ({
  isOpen,
  onClose,
  direccionId,
  onGuardar,
}) => {
  const {
    data: direccionData,
    isLoading: isLoadingDireccion,
    error: errorDireccion,
  } = useDireccionById(direccionId);

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
    initialForm:
      MODAL_EDITAR_DIRECCION_INITIAL_FORM,

    entity: direccionData,

    mapEntityToForm:
      mapDireccionByIdApiToEditFormData,

    onClose,

    onSubmit: (data) => {
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

    validate:
      validateDireccionEditForm,

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

  if (!isOpen || !direccionId) {
    return null;
  }

  if (isLoadingDireccion) {
    return (
      <ModalAsyncStatusLayout
        isOpen={isOpen}
        title={
          MODAL_EDITAR_DIRECCION_TEXTS.title
        }
        onClose={handleCancel}
        submitLabel={
          MODAL_EDITAR_DIRECCION_TEXTS.submitLabel
        }
        minHeight={
          MODAL_EDITAR_DIRECCION_LAYOUT.minHeight
        }
        variant="loading"
      >
        {
          MODAL_EDITAR_DIRECCION_TEXTS.loadingDireccion
        }
      </ModalAsyncStatusLayout>
    );
  }

  if (errorDireccion) {
    return (
      <ModalAsyncStatusLayout
        isOpen={isOpen}
        title={
          MODAL_EDITAR_DIRECCION_TEXTS.title
        }
        onClose={handleCancel}
        submitLabel={
          MODAL_EDITAR_DIRECCION_TEXTS.submitLabel
        }
        minHeight={
          MODAL_EDITAR_DIRECCION_LAYOUT.minHeight
        }
        variant="error"
      >
        {
          MODAL_EDITAR_DIRECCION_TEXTS.errorDireccionPrefix
        }{' '}
        {errorDireccion}
      </ModalAsyncStatusLayout>
    );
  }

  if (!direccionData) {
    return (
      <ModalAsyncStatusLayout
        isOpen={isOpen}
        title={
          MODAL_EDITAR_DIRECCION_TEXTS.title
        }
        onClose={handleCancel}
        submitLabel={
          MODAL_EDITAR_DIRECCION_TEXTS.submitLabel
        }
        minHeight={
          MODAL_EDITAR_DIRECCION_LAYOUT.minHeight
        }
        variant="error"
      >
        {
          MODAL_EDITAR_DIRECCION_TEXTS.emptyDireccion
        }
      </ModalAsyncStatusLayout>
    );
  }

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={
        MODAL_EDITAR_DIRECCION_TEXTS.title
      }
      onClose={handleCancel}
      submitLabel={
        MODAL_EDITAR_DIRECCION_TEXTS.submitLabel
      }
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
      minHeight={
        MODAL_EDITAR_DIRECCION_LAYOUT.minHeight
      }
    >
      <DireccionFormFields
        form={form}
        errors={errors}
        onChange={handleChange}
        onDepartamentoChange={
          handleDepartamentoChange
        }
        onProvinciaChange={
          handleProvinciaChange
        }
        onEstadoChange={(value) =>
          handleChange('estado', value)
        }
        labels={
          MODAL_EDITAR_DIRECCION_LABELS
        }
        placeholders={
          MODAL_EDITAR_DIRECCION_PLACEHOLDERS
        }
        layout={
          MODAL_EDITAR_DIRECCION_LAYOUT
        }
        departamentos={departamentos}
        provincias={provincias}
        distritos={distritos}
        refUbicacionOptions={
          refUbicacionOptions
        }
        refUbicacionValue={
          form.refUbicacion
        }
        isLoadingDepartamentos={
          isLoadingDepartamentos
        }
        isLoadingProvincias={
          isLoadingProvincias
        }
        isLoadingDistritos={
          isLoadingDistritos
        }
        isLoadingUbicaciones={
          isLoadingUbicaciones
        }
        errorDepartamentos={
          errorDepartamentos
        }
        errorUbicaciones={
          errorUbicaciones
        }
        showEstado
        estadosOptions={
          estadosDireccionOptions
        }
      />

      <ModalErrorSummary
        errors={errors}
        title={
          MODAL_EDITAR_DIRECCION_TEXTS.validationSummary
        }
      />
    </ModalFormLayout>
  );
};

export default ModalEditarDireccion;