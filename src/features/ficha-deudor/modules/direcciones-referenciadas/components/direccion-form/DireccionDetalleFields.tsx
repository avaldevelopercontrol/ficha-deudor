import React from 'react';

import {
  SelectField,
  TextAreaField,
} from '@shared/components/ui';
import { toStringValue } from '@shared/utils/formValueMappers';

import { getLoadingSelectPlaceholder } from '../../../../shared/utils/catalogOptions.utils';
import type { DireccionFormFieldsProps } from './direccionFormFields.types';

type Props = Pick<
  DireccionFormFieldsProps,
  | 'form'
  | 'errors'
  | 'onChange'
  | 'labels'
  | 'placeholders'
  | 'limits'
  | 'layout'
  | 'refUbicacionOptions'
  | 'refUbicacionValue'
  | 'isLoadingUbicaciones'
  | 'errorUbicaciones'
>;

const DireccionDetalleFields: React.FC<Props> = ({
  form,
  errors,
  onChange,
  labels,
  placeholders,
  limits,
  layout,
  refUbicacionOptions,
  refUbicacionValue,
  isLoadingUbicaciones,
  errorUbicaciones,
}) => {
  const comentarioRows =
    limits?.comentarioRows ?? layout.comentarioRows ?? 3;

  return (
    <>
      <SelectField
        label={labels.refUbicacion}
        layout="inline"
        options={refUbicacionOptions}
        value={refUbicacionValue}
        onChange={(value) =>
          onChange('refUbicacion', String(value))
        }
        placeholder={getLoadingSelectPlaceholder(
          isLoadingUbicaciones,
          placeholders.loading,
          placeholders.select
        )}
        error={errors.refUbicacion || errorUbicaciones || ''}
        disabled={isLoadingUbicaciones}
        hidePlaceholder
      />

      <TextAreaField
        label={labels.comentario}
        layout="inline"
        placeholder={placeholders.comentario}
        value={toStringValue(form.comentario)}
        onChange={(event) =>
          onChange('comentario', event.target.value)
        }
        rows={comentarioRows}
        maxLength={limits?.comentarioMaxLength}
        error={errors.comentario}
      />
    </>
  );
};

export default DireccionDetalleFields;
