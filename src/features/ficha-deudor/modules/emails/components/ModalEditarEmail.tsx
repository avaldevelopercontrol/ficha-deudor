import React from 'react';
import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';

import { useModalForm } from '@shared/hooks/ui/useModalForm';
import { useEmailById } from '../hooks/useEmailsByDeudor';
import { useEmailCatalogosForm } from '../hooks/useEmailCatalogosForm';
import type { DeudorInfo } from '../../../shared/types';
import type {
  EmailEditFormData,
  EmailByIdApi,
} from '../types/email.types';

import { validateEmailEditForm } from '../validations/emailValidations';
import {
  MODAL_EDITAR_EMAIL_INITIAL_FORM,
  MODAL_EDITAR_EMAIL_LABELS,
  MODAL_EDITAR_EMAIL_LAYOUT,
  MODAL_EDITAR_EMAIL_LIMITS,
  MODAL_EDITAR_EMAIL_PLACEHOLDERS,
  MODAL_EDITAR_EMAIL_TEXTS,
} from '../constants/modalEditarEmail.constants';
import { mapEmailByIdApiToEditFormData } from '../mappers/modalEditarEmail.mapper';
import { ModalErrorSummary } from '../../../shared/components/modals/common/ModalErrorSummary';
import { ModalAsyncStatusLayout } from '../../../shared/components/modals/common/ModalAsyncStatusLayout';
import { EmailFormFields } from './EmailFormFields';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  emailId: string | null;
  onGuardar?: (data: EmailEditFormData) => void;
  deudorData?: DeudorInfo | null;
}

const ModalEditarEmail: React.FC<Props> = ({
  isOpen,
  onClose,
  emailId,
  onGuardar,
  deudorData,
}) => {
  const {
    data: emailApi,
    isLoading: isLoadingEmail,
    error: errorEmail,
  } = useEmailById(emailId);

  const { statusesOptions, isLoadingStatuses, errorStatuses } =
    useEmailCatalogosForm();

  const { form, errors, handleChange, handleSubmit, handleCancel } =
    useModalForm<EmailEditFormData, EmailByIdApi>({
      initialForm: MODAL_EDITAR_EMAIL_INITIAL_FORM,
      entity: emailApi,
      mapEntityToForm: mapEmailByIdApiToEditFormData,
      onClose,
      onSubmit: (data) => {
        onGuardar?.(data);
      },
      validate: validateEmailEditForm,
      resetOnClose: true,
    });

  if (!isOpen || !emailId) return null;

  if (isLoadingEmail) {
    return (
      <ModalAsyncStatusLayout
        isOpen={isOpen}
        title={MODAL_EDITAR_EMAIL_TEXTS.title}
        onClose={handleCancel}
        submitLabel={MODAL_EDITAR_EMAIL_TEXTS.submitLabel}
        minHeight={MODAL_EDITAR_EMAIL_LAYOUT.minHeight}
        variant="loading"
        deudorData={deudorData}
      >
        {MODAL_EDITAR_EMAIL_TEXTS.loadingEmail}
      </ModalAsyncStatusLayout>
    );
  }

  if (errorEmail) {
    return (
      <ModalAsyncStatusLayout
        isOpen={isOpen}
        title={MODAL_EDITAR_EMAIL_TEXTS.title}
        onClose={handleCancel}
        submitLabel={MODAL_EDITAR_EMAIL_TEXTS.submitLabel}
        minHeight={MODAL_EDITAR_EMAIL_LAYOUT.minHeight}
        variant="error"
      >
        {MODAL_EDITAR_EMAIL_TEXTS.errorEmailPrefix} {String(errorEmail)}
      </ModalAsyncStatusLayout>
    );
  }

  if (!emailApi) {
    return (
      <ModalAsyncStatusLayout
        isOpen={isOpen}
        title={MODAL_EDITAR_EMAIL_TEXTS.title}
        onClose={handleCancel}
        submitLabel={MODAL_EDITAR_EMAIL_TEXTS.submitLabel}
        minHeight={MODAL_EDITAR_EMAIL_LAYOUT.minHeight}
        variant="error"
      >
        {MODAL_EDITAR_EMAIL_TEXTS.emptyEmail}
      </ModalAsyncStatusLayout>
    );
  }

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={MODAL_EDITAR_EMAIL_TEXTS.title}
      onClose={handleCancel}
      submitLabel={MODAL_EDITAR_EMAIL_TEXTS.submitLabel}
      onSubmit={handleSubmit}
      minHeight={MODAL_EDITAR_EMAIL_LAYOUT.minHeight}
    >
      <EmailFormFields
        form={form}
        errors={errors}
        onChange={handleChange}
        labels={MODAL_EDITAR_EMAIL_LABELS}
        placeholders={MODAL_EDITAR_EMAIL_PLACEHOLDERS}
        limits={MODAL_EDITAR_EMAIL_LIMITS}
        layout={MODAL_EDITAR_EMAIL_LAYOUT}
        statusesOptions={statusesOptions}
        isLoadingStatuses={isLoadingStatuses}
        errorStatuses={errorStatuses}
      />

      <ModalErrorSummary
        errors={errors}
        title={MODAL_EDITAR_EMAIL_TEXTS.validationSummary}
      />
    </ModalFormLayout>
  );
};

export default ModalEditarEmail;