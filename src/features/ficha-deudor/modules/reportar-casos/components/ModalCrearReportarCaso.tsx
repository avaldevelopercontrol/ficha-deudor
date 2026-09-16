import React from 'react';

import { useModalForm } from '@shared/hooks/ui/useModalForm';

import {
  ModalErrorSummary,
} from '../../../shared/components/modals/common/ModalErrorSummary';
import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';
import type { DeudorInfo } from '../../../shared/types';
import {
  MODAL_CREAR_REPORTAR_CASO_INITIAL_FORM,
  MODAL_CREAR_REPORTAR_CASO_LAYOUT,
  MODAL_CREAR_REPORTAR_CASO_TEXTS,
} from '../constants/modalCrearReportarCaso.constants';
import type { ReportarCasoFormData } from '../types/reportarCaso.types';
import {
  hasRequiredReportarCasoSelections,
  validateReportarCasoForm,
} from '../validations/reportarCasoValidations';
import { ReportarCasoFormFields } from './ReportarCasoFormFields';

interface ModalCrearReportarCasoProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistrar: (data: ReportarCasoFormData) => Promise<void> | void;
  deudorData?: DeudorInfo | null;
}

const ModalCrearReportarCaso: React.FC<ModalCrearReportarCasoProps> = ({
  isOpen,
  onClose,
  onRegistrar,
  deudorData,
}) => {
  const {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useModalForm<ReportarCasoFormData>({
    initialForm: MODAL_CREAR_REPORTAR_CASO_INITIAL_FORM,
    onClose,
    onSubmit: onRegistrar,
    validate: validateReportarCasoForm,
    resetOnClose: true,
  });

  const isSubmitDisabled =
    !hasRequiredReportarCasoSelections(form);

  if (!isOpen) {
    return null;
  }

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={MODAL_CREAR_REPORTAR_CASO_TEXTS.title}
      onClose={handleCancel}
      submitLabel={MODAL_CREAR_REPORTAR_CASO_TEXTS.submitLabel}
      loadingLabel={MODAL_CREAR_REPORTAR_CASO_TEXTS.loadingLabel}
      onSubmit={handleSubmit}
      minHeight={MODAL_CREAR_REPORTAR_CASO_LAYOUT.minHeight}
      size="md"
      deudorData={deudorData}
      isSubmitting={isSubmitting}
      submitDisabled={isSubmitDisabled}
      submitError={submitError}
    >
      <ReportarCasoFormFields
        form={form}
        errors={errors}
        onChange={handleChange}
      />

      <ModalErrorSummary
        errors={errors}
        title={MODAL_CREAR_REPORTAR_CASO_TEXTS.validationSummary}
      />
    </ModalFormLayout>
  );
};

export default ModalCrearReportarCaso;
