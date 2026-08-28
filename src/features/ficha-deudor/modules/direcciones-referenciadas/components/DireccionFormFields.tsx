import React from 'react';

import { InputField } from '@shared/components/ui';
import { toStringValue } from '@shared/utils/formValueMappers';

import DireccionClasificacionFields from './direccion-form/DireccionClasificacionFields';
import DireccionDetalleFields from './direccion-form/DireccionDetalleFields';
import DireccionUbicacionFields from './direccion-form/DireccionUbicacionFields';
import type { DireccionFormFieldsProps } from './direccion-form/direccionFormFields.types';

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
}) => (
  <>
    <InputField
      label={labels.direccion}
      layout="inline"
      placeholder={placeholders.direccion}
      value={toStringValue(form.direccion)}
      onChange={(event) =>
        onChange('direccion', event.target.value)
      }
      maxLength={limits?.direccionMaxLength}
      error={errors.direccion}
      required
    />

    <DireccionUbicacionFields
      form={form}
      errors={errors}
      onChange={onChange}
      onDepartamentoChange={onDepartamentoChange}
      onProvinciaChange={onProvinciaChange}
      labels={labels}
      placeholders={placeholders}
      layout={layout}
      departamentos={departamentos}
      provincias={provincias}
      distritos={distritos}
      isLoadingDepartamentos={isLoadingDepartamentos}
      isLoadingProvincias={isLoadingProvincias}
      isLoadingDistritos={isLoadingDistritos}
      errorDepartamentos={errorDepartamentos}
    />

    <DireccionDetalleFields
      form={form}
      errors={errors}
      onChange={onChange}
      labels={labels}
      placeholders={placeholders}
      limits={limits}
      layout={layout}
      refUbicacionOptions={refUbicacionOptions}
      refUbicacionValue={refUbicacionValue}
      isLoadingUbicaciones={isLoadingUbicaciones}
      errorUbicaciones={errorUbicaciones}
    />

    <DireccionClasificacionFields
      form={form}
      errors={errors}
      onChange={onChange}
      onEstadoChange={onEstadoChange}
      labels={labels}
      placeholders={placeholders}
      layout={layout}
      showEstado={showEstado}
      estadosOptions={estadosOptions}
    />
  </>
);
