import React from 'react';

import { FormGrid } from '@shared/components/ui/FormGrid';
import { SelectField } from '@shared/components/ui';
import {
  toBooleanValue,
  toStringValue,
} from '@shared/utils/formValueMappers';

import {
  llegoDeBaseOptions,
  tipoDeudorOptions,
} from '../../constants/catalogosDireccion.constants';
import type { DireccionFormFieldsProps } from './direccionFormFields.types';

type Props = Pick<
  DireccionFormFieldsProps,
  | 'form'
  | 'errors'
  | 'onChange'
  | 'onEstadoChange'
  | 'labels'
  | 'placeholders'
  | 'layout'
  | 'showEstado'
  | 'estadosOptions'
>;

const DireccionClasificacionFields: React.FC<Props> = ({
  form,
  errors,
  onChange,
  onEstadoChange,
  labels,
  placeholders,
  layout,
  showEstado = false,
  estadosOptions = [],
}) => {
  const footerPlaceholder =
    placeholders.compactSelect ?? placeholders.select;

  return (
    <>
      <FormGrid columns={layout.footerColumns}>
        <SelectField
          label={labels.llegoDeBase}
          layout="inline"
          options={llegoDeBaseOptions}
          value={form.llegoDeBase}
          onChange={(value) =>
            onChange('llegoDeBase', toBooleanValue(value))
          }
          placeholder={footerPlaceholder}
          error={errors.llegoDeBase}
          hidePlaceholder
        />

        <SelectField
          label={labels.tipoDeudor}
          layout="inline"
          options={tipoDeudorOptions}
          value={toStringValue(form.tipoDeudor)}
          onChange={(value) =>
            onChange('tipoDeudor', String(value))
          }
          placeholder={footerPlaceholder}
          error={errors.tipoDeudor}
          hidePlaceholder
        />
      </FormGrid>

      {showEstado && labels.estado && onEstadoChange && (
        <SelectField
          label={labels.estado}
          layout="inline"
          options={estadosOptions}
          value={form.estado ?? true}
          onChange={(value) =>
            onEstadoChange(toBooleanValue(value))
          }
          placeholder={footerPlaceholder}
          hidePlaceholder
        />
      )}
    </>
  );
};

export default DireccionClasificacionFields;
