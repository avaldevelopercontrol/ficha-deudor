import React from 'react';

import { useModalForm } from '@shared/hooks/ui/useModalForm';

import { ModalAsyncStatusLayout } from '../../../shared/components/modals/common/ModalAsyncStatusLayout';
import { ModalErrorSummary } from '../../../shared/components/modals/common/ModalErrorSummary';
import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';
import type { DeudorInfo } from '../../../shared/types';
import {
  MODAL_CREAR_REPORTAR_CASO_LAYOUT,
} from '../constants/modalCrearReportarCaso.constants';
import {
  MODAL_EDITAR_REPORTAR_CASO_INITIAL_FORM,
  MODAL_EDITAR_REPORTAR_CASO_TEXTS,
} from '../constants/modalEditarReportarCaso.constants';
import { useReportarCasoById } from '../hooks/useReportarCasos';
import { mapReportarCasoByIdApiToFormData } from '../mappers/modalEditarReportarCaso.mapper';
import type {
  ReportarCasoByIdApi,
  ReportarCasoFormData,
} from '../types/reportarCaso.types';
import {
  hasRequiredReportarCasoSelections,
  validateReportarCasoForm,
} from '../validations/reportarCasoValidations';
import { ReportarCasoFormFields } from './ReportarCasoFormFields';

interface ModalEditarReportarCasoProps {
  isOpen: boolean;
  onClose: () => void;
  casoId: string | null;
  onGuardar: (
    data: ReportarCasoFormData,
    original: ReportarCasoByIdApi
  ) => Promise<void> | void;
  deudorData?: DeudorInfo | null;
}

const ModalEditarReportarCaso: React.FC<
  ModalEditarReportarCasoProps
> = ({ isOpen, onClose, casoId, onGuardar, deudorData }) => {
  const {
    data: casoApi,
    isLoading,
    error,
  } = useReportarCasoById(isOpen ? casoId : null);

  const {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useModalForm<ReportarCasoFormData, ReportarCasoByIdApi>({
    initialForm: MODAL_EDITAR_REPORTAR_CASO_INITIAL_FORM,
    entity: casoApi,
    mapEntityToForm: mapReportarCasoByIdApiToFormData,
    onClose,
    onSubmit: (data) => {
      if (!casoApi) {
        throw new Error(MODAL_EDITAR_REPORTAR_CASO_TEXTS.emptyCase);
      }

      return onGuardar(data, casoApi);
    },
    validate: validateReportarCasoForm,
    resetOnClose: true,
  });

  if (!isOpen || !casoId) {
    return null;
  }

  if (isLoading) {
    return (
      <ModalAsyncStatusLayout
        isOpen={isOpen}
        title={MODAL_EDITAR_REPORTAR_CASO_TEXTS.title}
        onClose={handleCancel}
        submitLabel={MODAL_EDITAR_REPORTAR_CASO_TEXTS.submitLabel}
        minHeight={MODAL_CREAR_REPORTAR_CASO_LAYOUT.minHeight}
        variant="loading"
        deudorData={deudorData}
      >
        {MODAL_EDITAR_REPORTAR_CASO_TEXTS.loadingCase}
      </ModalAsyncStatusLayout>
    );
  }

  if (error) {
    return (
      <ModalAsyncStatusLayout
        isOpen={isOpen}
        title={MODAL_EDITAR_REPORTAR_CASO_TEXTS.title}
        onClose={handleCancel}
        submitLabel={MODAL_EDITAR_REPORTAR_CASO_TEXTS.submitLabel}
        minHeight={MODAL_CREAR_REPORTAR_CASO_LAYOUT.minHeight}
        variant="error"
        deudorData={deudorData}
      >
        {MODAL_EDITAR_REPORTAR_CASO_TEXTS.errorCasePrefix} {error}
      </ModalAsyncStatusLayout>
    );
  }

  if (!casoApi) {
    return (
      <ModalAsyncStatusLayout
        isOpen={isOpen}
        title={MODAL_EDITAR_REPORTAR_CASO_TEXTS.title}
        onClose={handleCancel}
        submitLabel={MODAL_EDITAR_REPORTAR_CASO_TEXTS.submitLabel}
        minHeight={MODAL_CREAR_REPORTAR_CASO_LAYOUT.minHeight}
        variant="error"
        deudorData={deudorData}
      >
        {MODAL_EDITAR_REPORTAR_CASO_TEXTS.emptyCase}
      </ModalAsyncStatusLayout>
    );
  }

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={MODAL_EDITAR_REPORTAR_CASO_TEXTS.title}
      onClose={handleCancel}
      submitLabel={MODAL_EDITAR_REPORTAR_CASO_TEXTS.submitLabel}
      loadingLabel={MODAL_EDITAR_REPORTAR_CASO_TEXTS.loadingLabel}
      onSubmit={handleSubmit}
      minHeight={MODAL_CREAR_REPORTAR_CASO_LAYOUT.minHeight}
      size="md"
      deudorData={deudorData}
      isSubmitting={isSubmitting}
      submitDisabled={!hasRequiredReportarCasoSelections(form)}
      submitError={submitError}
    >
      <ReportarCasoFormFields
        form={form}
        errors={errors}
        onChange={handleChange}
      />

      <ModalErrorSummary
        errors={errors}
        title={MODAL_EDITAR_REPORTAR_CASO_TEXTS.validationSummary}
      />
    </ModalFormLayout>
  );
};

export default ModalEditarReportarCaso;
