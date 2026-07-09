import React from 'react';

import { FormGrid } from '@shared/components/ui/FormGrid';
import {
  InputField,
  SelectField,
  TextAreaField,
} from '@shared/components/ui';
import type { DireccionFormData } from '../types/direccion.types';
import {
  toBooleanValue,
  toStringValue,
} from '@shared/utils/formValueMappers';
import {
  llegoDeBaseOptions,
  tipoDeudorOptions,
} from '../constants/catalogosDireccion.constants';
import type {
  FormGridColumns,
  SelectOption,
} from '../../../shared/types/formField.types';
import { getLoadingSelectPlaceholder } from '../../../shared/utils/catalogOptions.utils';

type DireccionFormField =
  | 'direccion'
  | 'departamento'
  | 'provincia'
  | 'distrito'
  | 'refUbicacion'
  | 'comentario'
  | 'llegoDeBase'
  | 'tipoDeudor';

type DireccionFormFieldValue = string | boolean;

type DireccionFormValues = Pick<DireccionFormData, DireccionFormField>;

type DireccionFormErrors = Partial<Record<DireccionFormField, string>>;

type DireccionFormLabels = Record<DireccionFormField, string> & {
  estado?: string;
};

interface DireccionFormPlaceholders {
  direccion: string;
  comentario: string;
  select: string;
  loading: string;
  compactSelect?: string;
}

interface DireccionFormLimits {
  direccionMaxLength?: number;
  comentarioMaxLength?: number;
  comentarioRows?: number;
}

interface DireccionFormLayout {
  ubicacionColumns: FormGridColumns;
  footerColumns: FormGridColumns;
  comentarioRows?: number;
}

interface DireccionFormFieldsProps {
  form: DireccionFormValues & {
    estado?: boolean;
  };
  errors: DireccionFormErrors;
  onChange: (field: DireccionFormField, value: DireccionFormFieldValue) => void;
  onDepartamentoChange?: (value: string | number) => void;
  onProvinciaChange?: (value: string | number) => void;
  onEstadoChange?: (value: boolean) => void;
  labels: DireccionFormLabels;
  placeholders: DireccionFormPlaceholders;
  limits?: DireccionFormLimits;
  layout: DireccionFormLayout;
  departamentos: SelectOption[];
  provincias: SelectOption[];
  distritos: SelectOption[];
  refUbicacionOptions: SelectOption[];
  refUbicacionValue: string;
  isLoadingDepartamentos: boolean;
  isLoadingProvincias: boolean;
  isLoadingDistritos: boolean;
  isLoadingUbicaciones: boolean;
  errorDepartamentos?: string | null;
  errorUbicaciones?: string | null;
  showEstado?: boolean;
  estadosOptions?: SelectOption<boolean>[];
}

export const DireccionFormFields: React.FC<DireccionFormFieldsProps> = ({
  form,
  errors,
  onChange,
  onDepartamentoChange,
  onProvinciaChange,
  onEstadoChange,
  labels,
  placeholders,
  limits,
  layout,
  departamentos,
  provincias,
  distritos,
  refUbicacionOptions,
  refUbicacionValue,
  isLoadingDepartamentos,
  isLoadingProvincias,
  isLoadingDistritos,
  isLoadingUbicaciones,
  errorDepartamentos,
  errorUbicaciones,
  showEstado = false,
  estadosOptions = [],
}) => {
  const comentarioRows = limits?.comentarioRows ?? layout.comentarioRows ?? 3;

  const footerPlaceholder = placeholders.compactSelect ?? placeholders.select;

  const handleDepartamentoChange = (value: string | number) => {
    if (onDepartamentoChange) {
      onDepartamentoChange(value);
      return;
    }

    onChange('departamento', String(value));
  };

  const handleProvinciaChange = (value: string | number) => {
    if (onProvinciaChange) {
      onProvinciaChange(value);
      return;
    }

    onChange('provincia', String(value));
  };

  return (
    <>
      <InputField
        label={labels.direccion}
        layout="inline"
        placeholder={placeholders.direccion}
        value={toStringValue(form.direccion)}
        onChange={(e) => onChange('direccion', e.target.value)}
        maxLength={limits?.direccionMaxLength}
        error={errors.direccion}
        required
      />

      <FormGrid columns={layout.ubicacionColumns}>
        <SelectField
          label={labels.departamento}
          layout="inline"
          options={departamentos}
          value={toStringValue(form.departamento)}
          onChange={handleDepartamentoChange}
          placeholder={getLoadingSelectPlaceholder(
            isLoadingDepartamentos,
            placeholders.loading,
            placeholders.select
          )}
          error={errors.departamento || errorDepartamentos || ''}
          required
          disabled={isLoadingDepartamentos}
        />

        <SelectField
          label={labels.provincia}
          layout="inline"
          options={provincias}
          value={toStringValue(form.provincia)}
          onChange={handleProvinciaChange}
          placeholder={getLoadingSelectPlaceholder(
            isLoadingProvincias,
            placeholders.loading,
            placeholders.select
          )}
          disabled={!form.departamento || isLoadingProvincias}
          error={errors.provincia}
          required
        />

        <SelectField
          label={labels.distrito}
          layout="inline"
          options={distritos}
          value={toStringValue(form.distrito)}
          onChange={(v) => onChange('distrito', String(v))}
          placeholder={getLoadingSelectPlaceholder(
            isLoadingDistritos,
            placeholders.loading,
            placeholders.select
          )}
          disabled={!form.provincia || isLoadingDistritos}
          error={errors.distrito}
          required
        />
      </FormGrid>

      <SelectField
        label={labels.refUbicacion}
        layout="inline"
        options={refUbicacionOptions}
        value={refUbicacionValue}
        onChange={(v) => onChange('refUbicacion', String(v))}
        placeholder={getLoadingSelectPlaceholder(
          isLoadingUbicaciones,
          placeholders.loading,
          placeholders.select
        )}
        error={errors.refUbicacion || errorUbicaciones || ''}
        disabled={isLoadingUbicaciones}
      />

      <TextAreaField
        label={labels.comentario}
        layout="inline"
        placeholder={placeholders.comentario}
        value={toStringValue(form.comentario)}
        onChange={(e) => onChange('comentario', e.target.value)}
        rows={comentarioRows}
        maxLength={limits?.comentarioMaxLength}
        error={errors.comentario}
      />

      <FormGrid columns={layout.footerColumns}>
        <SelectField
          label={labels.llegoDeBase}
          layout="inline"
          options={llegoDeBaseOptions}
          value={form.llegoDeBase}
          onChange={(v) => onChange('llegoDeBase', toBooleanValue(v))}
          placeholder={footerPlaceholder}
          error={errors.llegoDeBase}
          hidePlaceholder={!placeholders.compactSelect}
        />

        <SelectField
          label={labels.tipoDeudor}
          layout="inline"
          options={tipoDeudorOptions}
          value={toStringValue(form.tipoDeudor)}
          onChange={(v) => onChange('tipoDeudor', String(v))}
          placeholder={footerPlaceholder}
          error={errors.tipoDeudor}
          hidePlaceholder={!placeholders.compactSelect}
        />
      </FormGrid>

      {showEstado && labels.estado && onEstadoChange && (
        <SelectField
          label={labels.estado}
          layout="inline"
          options={estadosOptions}
          value={form.estado ?? true}
          onChange={(v) => onEstadoChange(toBooleanValue(v))}
          placeholder={footerPlaceholder}
        />
      )}
    </>
  );
};