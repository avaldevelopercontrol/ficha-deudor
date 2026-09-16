import React from 'react';

import { SelectField, TextAreaField } from '@shared/components/ui';

import {
  MODAL_CREAR_REPORTAR_CASO_LABELS,
  MODAL_CREAR_REPORTAR_CASO_LAYOUT,
  MODAL_CREAR_REPORTAR_CASO_PLACEHOLDERS,
  REPORTAR_CASO_MAF_OPTIONS,
  REPORTAR_CASO_TIPO_SINIESTRO_OPTIONS,
} from '../constants/modalCrearReportarCaso.constants';
import type { ReportarCasoFormData } from '../types/reportarCaso.types';
import type { ReportarCasoFormErrors } from '../validations/reportarCasoValidations';

interface ReportarCasoFormFieldsProps {
  form: ReportarCasoFormData;
  errors: ReportarCasoFormErrors;
  onChange: <K extends keyof ReportarCasoFormData>(
    field: K,
    value: ReportarCasoFormData[K]
  ) => void;
}

export const ReportarCasoFormFields: React.FC<
  ReportarCasoFormFieldsProps
> = ({ form, errors, onChange }) => (
  <>
    <SelectField
      label={MODAL_CREAR_REPORTAR_CASO_LABELS.caso}
      layout="inline"
      options={REPORTAR_CASO_MAF_OPTIONS}
      value={form.caso}
      onChange={(value) => onChange('caso', String(value))}
      hidePlaceholder
      error={errors.caso}
      required
    />

    <TextAreaField
      label={MODAL_CREAR_REPORTAR_CASO_LABELS.descripcion}
      layout="inline"
      value={form.descripcion}
      onChange={(event) =>
        onChange('descripcion', event.target.value)
      }
      placeholder={MODAL_CREAR_REPORTAR_CASO_PLACEHOLDERS.descripcion}
      rows={MODAL_CREAR_REPORTAR_CASO_LAYOUT.descripcionRows}
      error={errors.descripcion}
      required
    />

    <SelectField
      label={MODAL_CREAR_REPORTAR_CASO_LABELS.tipoSiniestro}
      layout="inline"
      options={REPORTAR_CASO_TIPO_SINIESTRO_OPTIONS}
      value={form.tipoSiniestro}
      onChange={(value) =>
        onChange('tipoSiniestro', String(value))
      }
      placeholder={MODAL_CREAR_REPORTAR_CASO_PLACEHOLDERS.select}
      error={errors.tipoSiniestro}
      required
    />
  </>
);
