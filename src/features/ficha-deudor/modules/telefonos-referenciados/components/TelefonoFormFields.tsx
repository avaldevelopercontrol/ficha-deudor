import React from 'react';

import { FormGrid } from '@shared/components/ui/FormGrid';
import {
  InputField,
  SelectField,
  TextAreaField,
} from '@shared/components/ui';
import type { TelefonoFormData } from '../types/telefono.types';
import {
  toBooleanValue,
  toNumberValue,
} from '@shared/utils/formValueMappers';
import {
  prioridadesOptions,
  referenciasOptions,
  reclamoIndecopiOptions,
} from '../constants/catalogosTelefono.constants';
import type {
  FormGridColumns,
  SelectOption,
} from '../../../shared/types/formField.types';
import { getLoadingSelectPlaceholder } from '../../../shared/utils/catalogOptions.utils';

type TelefonoFormField =
  | 'numero'
  | 'anexo'
  | 'resultado'
  | 'operadorTelefonico'
  | 'ubicacion'
  | 'prioridad'
  | 'horarioGestion'
  | 'fuenteBusqueda'
  | 'comentario'
  | 'referencia'
  | 'reclamoIndecopi';

type TelefonoFormFieldValue = string | number | boolean;

type TelefonoFormValues = Pick<TelefonoFormData, TelefonoFormField>;

type TelefonoFormErrors = Partial<Record<TelefonoFormField, string>>;

type TelefonoFormLabels = Record<TelefonoFormField, string>;

interface TelefonoFormPlaceholders {
  numero: string;
  anexo: string;
  comentario: string;
  select: string;
  loading: string;
}

interface TelefonoFormLimits {
  numeroMaxLength: number;
  anexoMaxLength: number;
  comentarioRows: number;
}

interface TelefonoFormLayout {
  inputColumns: FormGridColumns;
  selectColumns: FormGridColumns;
  footerColumns: FormGridColumns;
}

interface TelefonoFormFieldsProps {
  form: TelefonoFormValues;
  errors: TelefonoFormErrors;
  onChange: (field: TelefonoFormField, value: TelefonoFormFieldValue) => void;
  labels: TelefonoFormLabels;
  placeholders: TelefonoFormPlaceholders;
  limits: TelefonoFormLimits;
  layout: TelefonoFormLayout;
  resultadosOptions: SelectOption[];
  operadoresOptions: SelectOption[];
  ubicacionesOptions: SelectOption[];
  horariosGestionOptions: SelectOption[];
  fuentesBusquedaOptions: SelectOption[];
  isLoadingResultados: boolean;
  isLoadingOperadores: boolean;
  isLoadingUbicaciones: boolean;
  isLoadingHorarios: boolean;
  isLoadingFuentes: boolean;
  errorResultados?: string | null;
  errorOperadores?: string | null;
  errorUbicaciones?: string | null;
  errorHorarios?: string | null;
  errorFuentes?: string | null;
  requireAdvancedFields?: boolean;
}

export const TelefonoFormFields: React.FC<TelefonoFormFieldsProps> = ({
  form,
  errors,
  onChange,
  labels,
  placeholders,
  limits,
  layout,
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
}) => {
  return (
    <>
      <FormGrid columns={layout.inputColumns}>
        <InputField
          label={labels.numero}
          layout="inline"
          placeholder={placeholders.numero}
          value={form.numero}
          onChange={(e) => onChange('numero', e.target.value)}
          maxLength={limits.numeroMaxLength}
          error={errors.numero}
          required
        />

        <InputField
          label={labels.anexo}
          layout="inline"
          placeholder={placeholders.anexo}
          value={form.anexo}
          onChange={(e) => onChange('anexo', e.target.value)}
          maxLength={limits.anexoMaxLength}
          error={errors.anexo}
        />
      </FormGrid>

      <FormGrid columns={layout.selectColumns}>
        <SelectField
          label={labels.resultado}
          layout="inline"
          options={resultadosOptions}
          value={form.resultado}
          onChange={(v) => onChange('resultado', String(v))}
          placeholder={getLoadingSelectPlaceholder(
            isLoadingResultados,
            placeholders.loading,
            placeholders.select
          )}
          error={errors.resultado || errorResultados || ''}
          required
          disabled={isLoadingResultados}
        />

        <SelectField
          label={labels.operadorTelefonico}
          layout="inline"
          options={operadoresOptions}
          value={form.operadorTelefonico}
          onChange={(v) => onChange('operadorTelefonico', String(v))}
          placeholder={getLoadingSelectPlaceholder(
            isLoadingOperadores,
            placeholders.loading,
            placeholders.select
          )}
          error={errors.operadorTelefonico || errorOperadores || ''}
          required
          disabled={isLoadingOperadores}
        />

        <SelectField
          label={labels.ubicacion}
          layout="inline"
          options={ubicacionesOptions}
          value={form.ubicacion}
          onChange={(v) => onChange('ubicacion', String(v))}
          placeholder={getLoadingSelectPlaceholder(
            isLoadingUbicaciones,
            placeholders.loading,
            placeholders.select
          )}
          error={errors.ubicacion || errorUbicaciones || ''}
          required
          disabled={isLoadingUbicaciones}
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
        />

        <SelectField
          label={labels.horarioGestion}
          layout="inline"
          options={horariosGestionOptions}
          value={form.horarioGestion}
          onChange={(v) => onChange('horarioGestion', String(v))}
          placeholder={getLoadingSelectPlaceholder(
            isLoadingHorarios,
            placeholders.loading,
            placeholders.select
          )}
          error={errors.horarioGestion || errorHorarios || ''}
          disabled={isLoadingHorarios}
        />

        <SelectField
          label={labels.fuenteBusqueda}
          layout="inline"
          options={fuentesBusquedaOptions}
          value={form.fuenteBusqueda}
          onChange={(v) => onChange('fuenteBusqueda', String(v))}
          placeholder={getLoadingSelectPlaceholder(
            isLoadingFuentes,
            placeholders.loading,
            placeholders.select
          )}
          error={errors.fuenteBusqueda || errorFuentes || ''}
          disabled={isLoadingFuentes}
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

      <FormGrid columns={layout.footerColumns}>
        <SelectField
          label={labels.referencia}
          layout="inline"
          options={referenciasOptions}
          value={form.referencia}
          onChange={(v) => onChange('referencia', toNumberValue(v))}
          placeholder={placeholders.select}
          error={errors.referencia}
        />

        <SelectField
          label={labels.reclamoIndecopi}
          layout="inline"
          options={reclamoIndecopiOptions}
          value={form.reclamoIndecopi}
          onChange={(v) => onChange('reclamoIndecopi', toBooleanValue(v))}
          error={errors.reclamoIndecopi}
          hidePlaceholder
        />
      </FormGrid>
    </>
  );
};