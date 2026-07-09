import React from 'react';

import { FormGrid } from '@shared/components/ui/FormGrid';
import {
  InputField,
  SelectField,
  TextAreaField,
} from '@shared/components/ui';
import type { EmailFormData } from '../types/email.types';
import { toBooleanValue } from '@shared/utils/formValueMappers';
import {
  prioridadesOptions,
  estadosEmailOptions,
} from '../constants/catalogoEmail.constants';
import type {
  FormGridColumns,
  SelectOption,
} from '../../../shared/types/formField.types';
import { getLoadingSelectPlaceholder } from '../../../shared/utils/catalogOptions.utils';

type EmailFormField =
  | 'email'
  | 'contacto'
  | 'prioridad'
  | 'estado'
  | 'status'
  | 'comentario';

type EmailFormFieldValue = string | boolean;

type EmailFormValues = Pick<EmailFormData, EmailFormField>;

type EmailFormErrors = Partial<Record<EmailFormField, string>>;

type EmailFormLabels = Record<EmailFormField, string>;

interface EmailFormPlaceholders {
  email: string;
  contacto: string;
  comentario: string;
  select: string;
  loading: string;
}

interface EmailFormLimits {
  emailMaxLength: number;
  contactoMaxLength: number;
  comentarioRows: number;
}

interface EmailFormLayout {
  mainColumns: FormGridColumns;
  selectColumns: FormGridColumns;
}

interface EmailFormFieldsProps {
  form: EmailFormValues;
  errors: EmailFormErrors;
  onChange: (field: EmailFormField, value: EmailFormFieldValue) => void;
  labels: EmailFormLabels;
  placeholders: EmailFormPlaceholders;
  limits: EmailFormLimits;
  layout: EmailFormLayout;
  statusesOptions: SelectOption[];
  isLoadingStatuses: boolean;
  errorStatuses?: string | null;
}

export const EmailFormFields: React.FC<EmailFormFieldsProps> = ({
  form,
  errors,
  onChange,
  labels,
  placeholders,
  limits,
  layout,
  statusesOptions,
  isLoadingStatuses,
  errorStatuses,
}) => {
  return (
    <>
      <FormGrid columns={layout.mainColumns}>
        <InputField
          label={labels.email}
          layout="inline"
          placeholder={placeholders.email}
          value={form.email}
          onChange={(e) => onChange('email', e.target.value)}
          maxLength={limits.emailMaxLength}
          error={errors.email}
          required
        />
      </FormGrid>

      <FormGrid columns={layout.mainColumns}>
        <InputField
          label={labels.contacto}
          layout="inline"
          placeholder={placeholders.contacto}
          value={form.contacto}
          onChange={(e) => onChange('contacto', e.target.value)}
          maxLength={limits.contactoMaxLength}
          error={errors.contacto}
          required
        />
      </FormGrid>

      <FormGrid columns={layout.selectColumns}>
        <SelectField
          label={labels.prioridad}
          layout="inline"
          options={prioridadesOptions}
          value={form.prioridad}
          onChange={(v) => onChange('prioridad', String(v))}
          placeholder={placeholders.select}
          error={errors.prioridad}
          required
        />

        <SelectField
          label={labels.estado}
          layout="inline"
          options={estadosEmailOptions}
          value={form.estado}
          onChange={(v) => onChange('estado', toBooleanValue(v))}
          placeholder={placeholders.select}
          hidePlaceholder
        />

        <SelectField
          label={labels.status}
          layout="inline"
          options={statusesOptions}
          value={form.status}
          onChange={(v) => onChange('status', String(v))}
          placeholder={getLoadingSelectPlaceholder(
            isLoadingStatuses,
            placeholders.loading,
            placeholders.select
          )}
          error={errors.status || errorStatuses || ''}
          required
          disabled={isLoadingStatuses}
        />
      </FormGrid>

      <TextAreaField
        label={labels.comentario}
        layout="inline"
        placeholder={placeholders.comentario}
        value={form.comentario}
        onChange={(e) => onChange('comentario', e.target.value)}
        rows={limits.comentarioRows}
        error={errors.comentario}
      />
    </>
  );
};