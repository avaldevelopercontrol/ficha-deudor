import React from 'react';

import { FormGrid } from '@shared/components/ui/FormGrid';
import { SelectField } from '@shared/components/ui';
import { toStringValue } from '@shared/utils/formValueMappers';

import { getLoadingSelectPlaceholder } from '../../../../shared/utils/catalogOptions.utils';
import type { DireccionFormFieldsProps } from './direccionFormFields.types';

type Props = Pick<
  DireccionFormFieldsProps,
  | 'form'
  | 'errors'
  | 'onChange'
  | 'onDepartamentoChange'
  | 'onProvinciaChange'
  | 'labels'
  | 'placeholders'
  | 'layout'
  | 'departamentos'
  | 'provincias'
  | 'distritos'
  | 'isLoadingDepartamentos'
  | 'isLoadingProvincias'
  | 'isLoadingDistritos'
  | 'errorDepartamentos'
>;

const DireccionUbicacionFields: React.FC<Props> = ({
  form,
  errors,
  onChange,
  onDepartamentoChange,
  onProvinciaChange,
  labels,
  placeholders,
  layout,
  departamentos,
  provincias,
  distritos,
  isLoadingDepartamentos,
  isLoadingProvincias,
  isLoadingDistritos,
  errorDepartamentos,
}) => {
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
        onChange={(value) => onChange('distrito', String(value))}
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
  );
};

export default DireccionUbicacionFields;
