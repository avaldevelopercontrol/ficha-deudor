import React from 'react';

import { ModalFormLayout } from '../../../shared/components/modals/ModalFormLayout';

import { useModalForm } from '@shared/hooks/ui/useModalForm';
import { useEmailCatalogosForm } from '../hooks/useEmailCatalogosForm';
import type { DeudorInfo } from '../../../shared/types';
import type { EmailFormData } from '../types/email.types';


import { validateEmailForm } from '../validations/emailValidations';
import {
  MODAL_REGISTRAR_EMAIL_INITIAL_FORM,
  MODAL_REGISTRAR_EMAIL_LABELS,
  MODAL_REGISTRAR_EMAIL_LAYOUT,
  MODAL_REGISTRAR_EMAIL_LIMITS,
  MODAL_REGISTRAR_EMAIL_PLACEHOLDERS,
  MODAL_REGISTRAR_EMAIL_TEXTS,
} from '../constants/modalRegistrarEmail.constants';
import { ModalErrorSummary } from '../../../shared/components/modals/common/ModalErrorSummary';
import { EmailFormFields } from './EmailFormFields';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegistrar?: (data: EmailFormData) => void;
  deudorData?: DeudorInfo | null;
}

const ModalRegistrarEmail: React.FC<Props> = ({
  isOpen,
  onClose,
  onRegistrar,
  deudorData,
}) => {
  const { statusesOptions, isLoadingStatuses, errorStatuses } =
    useEmailCatalogosForm();

  const { form, errors, handleChange, handleSubmit, handleCancel } =
    useModalForm<EmailFormData>({
      initialForm: MODAL_REGISTRAR_EMAIL_INITIAL_FORM,
      onClose,
      onSubmit: (data) => {
        onRegistrar?.(data);
      },
      validate: validateEmailForm,
      resetOnClose: true,
    });

  if (!isOpen) return null;

  return (
    <ModalFormLayout
      isOpen={isOpen}
      title={MODAL_REGISTRAR_EMAIL_TEXTS.title}
      onClose={handleCancel}
      submitLabel={MODAL_REGISTRAR_EMAIL_TEXTS.submitLabel}
      onSubmit={handleSubmit}
      minHeight={MODAL_REGISTRAR_EMAIL_LAYOUT.minHeight}
      deudorData={deudorData}
    >
      <EmailFormFields
        form={form}
        errors={errors}
        onChange={handleChange}
        labels={MODAL_REGISTRAR_EMAIL_LABELS}
        placeholders={MODAL_REGISTRAR_EMAIL_PLACEHOLDERS}
        limits={MODAL_REGISTRAR_EMAIL_LIMITS}
        layout={MODAL_REGISTRAR_EMAIL_LAYOUT}
        statusesOptions={statusesOptions}
        isLoadingStatuses={isLoadingStatuses}
        errorStatuses={errorStatuses}
      />

      <ModalErrorSummary
        errors={errors}
        title={MODAL_REGISTRAR_EMAIL_TEXTS.validationSummary}
      />
    </ModalFormLayout>
  );
};

export default ModalRegistrarEmail;