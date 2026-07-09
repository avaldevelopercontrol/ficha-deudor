import React from 'react';

import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';
import { useModalForm } from '@shared/hooks/ui/useModalForm';
import { useTelefonoCatalogosForm } from '../hooks/useTelefonoCatalogosForm';
import type { TelefonoFormData } from '../types/telefono.types';
import { validateTelefonoForm } from '../validations/telefonoValidations';
import {
  MODAL_REGISTRAR_TELEFONO_INITIAL_FORM,
  MODAL_REGISTRAR_TELEFONO_LABELS,
  MODAL_REGISTRAR_TELEFONO_LAYOUT,
  MODAL_REGISTRAR_TELEFONO_LIMITS,
  MODAL_REGISTRAR_TELEFONO_PLACEHOLDERS,
  MODAL_REGISTRAR_TELEFONO_TEXTS,
} from '../constants/modalRegistrarTelefono.constants';
import { ModalErrorSummary } from '../../../shared/components/modals/common/ModalErrorSummary';
import { TelefonoFormFields } from './TelefonoFormFields';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegistrar?: (data: TelefonoFormData) => void;
}

const ModalRegistrarTelefono: React.FC<Props> = ({
  isOpen,
  onClose,
  onRegistrar,
}) => {
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
  } = useTelefonoCatalogosForm();

  const { form, errors, handleChange, handleSubmit, handleCancel } =
    useModalForm<TelefonoFormData>({
      initialForm: MODAL_REGISTRAR_TELEFONO_INITIAL_FORM,
      onClose,
      onSubmit: (data) => {
        onRegistrar?.(data);
      },
      validate: validateTelefonoForm,
      resetOnClose: true,
    });

  if (!isOpen) return null;

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={MODAL_REGISTRAR_TELEFONO_TEXTS.title}
      onClose={handleCancel}
      submitLabel={MODAL_REGISTRAR_TELEFONO_TEXTS.submitLabel}
      onSubmit={handleSubmit}
      minHeight={MODAL_REGISTRAR_TELEFONO_LAYOUT.minHeight}
    >
      <TelefonoFormFields
        form={form}
        errors={errors}
        onChange={handleChange}
        labels={MODAL_REGISTRAR_TELEFONO_LABELS}
        placeholders={MODAL_REGISTRAR_TELEFONO_PLACEHOLDERS}
        limits={MODAL_REGISTRAR_TELEFONO_LIMITS}
        layout={MODAL_REGISTRAR_TELEFONO_LAYOUT}
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
      />

      <ModalErrorSummary
        errors={errors}
        title={MODAL_REGISTRAR_TELEFONO_TEXTS.validationSummary}
      />
    </ModalFormLayout>
  );
};

export default ModalRegistrarTelefono;