import {
  useMemo,
  type ReactNode,
} from 'react';

import {
  InputField,
  SelectField,
} from '@shared/components/ui';

import {
  SisgesIconPicker,
} from '@shared/icons/sisges';

import type {
  SelectOption,
} from '@shared/types';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  MODAL_REGISTRAR_MODULO_ESTADO_OPTIONS,
  MODAL_REGISTRAR_MODULO_LABELS,
  MODAL_REGISTRAR_MODULO_PLACEHOLDERS,
  MODAL_REGISTRAR_MODULO_SECTIONS,
  MODAL_REGISTRAR_MODULO_VISIBLE_OPTIONS,
} from '../constants/modalRegistrarModulo.constants';

import type {
  RegistrarModuloFieldChange,
  RegistrarModuloFormData,
} from '../types/registrarModulo.types';

interface RegistrarModuloFormFieldsProps {
  form:
    RegistrarModuloFormData;

  errors:
    Record<string, string>;

  modulos:
    readonly Modulo[];

  onChange:
    RegistrarModuloFieldChange;

  onNombreChange: (
    value: string
  ) => void;

  onCodigoChange: (
    value: string
  ) => void;
}

export const RegistrarModuloFormFields = ({
  form,
  errors,
  modulos,
  onChange,
  onNombreChange,
  onCodigoChange,
}: RegistrarModuloFormFieldsProps): ReactNode => {
  const parentOptions =
    useMemo<
      SelectOption<number>[]
    >(
      () =>
        modulos.map(
          (modulo) => ({
            id:
              modulo.idModulo,

            label:
              modulo.nombre ||
              modulo.codigo ||
              `Id ${modulo.idModulo}`,
          })
        ),
      [modulos]
    );


  return (
    <div className="registrar-modulo-form">
      <section className="registrar-modulo-form__section">
        <h2 className="registrar-modulo-form__section-title">
          {
            MODAL_REGISTRAR_MODULO_SECTIONS
              .general
          }
        </h2>

        <div className="registrar-modulo-form__grid">
          <InputField
            id="registrar-modulo-nombre"
            label={
              MODAL_REGISTRAR_MODULO_LABELS
                .nombre
            }
            layout="inline"
            value={
              form.nombre
            }
            onChange={(
              event
            ) => {
              onNombreChange(
                event.target.value
              );
            }}
            placeholder={
              MODAL_REGISTRAR_MODULO_PLACEHOLDERS
                .nombre
            }
            error={
              errors.nombre
            }
            autoComplete="off"
            required
          />

          <InputField
            id="registrar-modulo-codigo"
            label={
              MODAL_REGISTRAR_MODULO_LABELS
                .codigo
            }
            layout="inline"
            value={
              form.codigo
            }
            onChange={(
              event
            ) => {
              onCodigoChange(
                event.target.value
              );
            }}
            placeholder={
              MODAL_REGISTRAR_MODULO_PLACEHOLDERS
                .codigo
            }
            error={
              errors.codigo
            }
            autoComplete="off"
            required
          />

          <SisgesIconPicker
            id="registrar-modulo-icono"
            label={
              MODAL_REGISTRAR_MODULO_LABELS
                .icono
            }
            layout="inline"
            value={form.icono}
            placeholder={
              MODAL_REGISTRAR_MODULO_PLACEHOLDERS
                .icono
            }
            onChange={(value) => {
              onChange(
                'icono',
                value
              );
            }}
            error={errors.icono}
          />

          <SelectField<number>
            label={
              MODAL_REGISTRAR_MODULO_LABELS
                .padre
            }
            layout="inline"
            value={
              form.padreId
            }
            options={
              parentOptions
            }
            onChange={(
              value
            ) => {
              onChange(
                'padreId',
                value
              );
            }}
            error={
              errors.padreId
            }
          />

          <SelectField<boolean>
            label={
              MODAL_REGISTRAR_MODULO_LABELS
                .visible
            }
            layout="inline"
            value={
              form.visible
            }
            options={
              MODAL_REGISTRAR_MODULO_VISIBLE_OPTIONS
            }
            onChange={(
              value
            ) => {
              onChange(
                'visible',
                value
              );
            }}
            error={
              errors.visible
            }
            hidePlaceholder
          />

          <SelectField<boolean>
            label={
              MODAL_REGISTRAR_MODULO_LABELS
                .estado
            }
            layout="inline"
            value={
              form.estado
            }
            options={
              MODAL_REGISTRAR_MODULO_ESTADO_OPTIONS
            }
            onChange={(
              value
            ) => {
              onChange(
                'estado',
                value
              );
            }}
            error={
              errors.estado
            }
            hidePlaceholder
          />
        </div>
      </section>
    </div>
  );
};

export default RegistrarModuloFormFields;
