import React from 'react';

import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';
import { useModalForm } from '@shared/hooks/ui/useModalForm';
import type {
  DireccionEditFormData,
  DireccionByIdApi,
} from '../types/direccion.types';

import { useDireccionCatalogosForm } from '../hooks/useDireccionCatalogosForm';
import { useDireccionCascadeFields } from '../hooks/useDireccionCascadeFields';

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
import { ModalErrorSummary } from '../../../shared/components/modals/common/ModalErrorSummary';
import { DireccionFormFields } from './DireccionFormFields';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  direccionId: string | null;
  direccionData: DireccionByIdApi | null;
  onGuardar?: (data: DireccionEditFormData & { id: string }) => void;
}

const ModalEditarDireccion: React.FC<Props> = ({
  isOpen,
  onClose,
  direccionId,
  direccionData,
  onGuardar,
}) => {
  const { form, errors, handleChange, handleSubmit, handleCancel } =
    useModalForm<DireccionEditFormData, DireccionByIdApi>({
      initialForm: MODAL_EDITAR_DIRECCION_INITIAL_FORM,
      entity: direccionData,
      mapEntityToForm: mapDireccionByIdApiToEditFormData,
      onClose,
      onSubmit: (data) => {
        if (direccionId) {
          onGuardar?.({ ...data, id: direccionId });
        }
      },
      validate: validateDireccionEditForm,
      resetOnClose: true,
    });

  const { handleDepartamentoChange, handleProvinciaChange } =
    useDireccionCascadeFields({
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

  if (!isOpen || !direccionId) return null;

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={MODAL_EDITAR_DIRECCION_TEXTS.title}
      onClose={handleCancel}
      submitLabel={MODAL_EDITAR_DIRECCION_TEXTS.submitLabel}
      onSubmit={handleSubmit}
      minHeight={MODAL_EDITAR_DIRECCION_LAYOUT.minHeight}
    >
      <DireccionFormFields
        form={form}
        errors={errors}
        onChange={handleChange}
        onDepartamentoChange={handleDepartamentoChange}
        onProvinciaChange={handleProvinciaChange}
        onEstadoChange={(value) => handleChange('estado', value)}
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