import type {
  ReactNode,
} from 'react';

import {
  InputField,
  SelectField,
  TextAreaField,
} from '@shared/components/ui';

import {
  SisgesIconPicker,
} from '@shared/icons/sisges';

import type {
  SelectOption,
} from '@shared/types';

import {
  MODAL_REGISTRAR_MODULO_ESTADO_OPTIONS,
  MODAL_REGISTRAR_MODULO_LABELS,
  MODAL_REGISTRAR_MODULO_PLACEHOLDERS,
  MODAL_REGISTRAR_MODULO_SECTIONS,
  MODAL_REGISTRAR_MODULO_VISIBLE_OPTIONS,
} from '../constants/modalRegistrarModulo.constants';

import type {
  ModuloFormData,
} from '../types/registrarModulo.types';

interface ModuloFormFieldsProps {
  form: ModuloFormData;
  errors: Record<string, string>;
  parentOptions: SelectOption<number>[];
  parentDisabled?: boolean;
  visibleDisabled?: boolean;
  orderControl?: ReactNode;
  onNombreChange: (
    value: string
  ) => void;
  onDescripcionChange: (
    value: string
  ) => void;
  onCodigoChange: (
    value: string
  ) => void;
  onIconoChange: (
    value: string
  ) => void;
  onPadreChange: (
    value: number
  ) => void;
  onVisibleChange: (
    value: boolean
  ) => void;
  onEstadoChange: (
    value: boolean
  ) => void;
}

export const ModuloFormFields = ({
  form,
  errors,
  parentOptions,
  parentDisabled = false,
  visibleDisabled = false,
  orderControl,
  onNombreChange,
  onDescripcionChange,
  onCodigoChange,
  onIconoChange,
  onPadreChange,
  onVisibleChange,
  onEstadoChange,
}: ModuloFormFieldsProps): ReactNode => {
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
            id="modulo-nombre"
            label={
              MODAL_REGISTRAR_MODULO_LABELS
                .nombre
            }
            layout="inline"
            value={form.nombre}
            onChange={(event) => {
              onNombreChange(
                event.target.value
              );
            }}
            placeholder={
              MODAL_REGISTRAR_MODULO_PLACEHOLDERS
                .nombre
            }
            error={errors.nombre}
            autoComplete="off"
            required
          />

          <InputField
            id="modulo-codigo"
            label={
              MODAL_REGISTRAR_MODULO_LABELS
                .codigo
            }
            layout="inline"
            value={form.codigo}
            onChange={(event) => {
              onCodigoChange(
                event.target.value
              );
            }}
            placeholder={
              MODAL_REGISTRAR_MODULO_PLACEHOLDERS
                .codigo
            }
            error={errors.codigo}
            autoComplete="off"
            required
          />

          <TextAreaField
            id="modulo-descripcion"
            label={
              MODAL_REGISTRAR_MODULO_LABELS
                .descripcion
            }
            layout="inline"
            value={form.descripcion}
            onChange={(event) => {
              onDescripcionChange(
                event.target.value
              );
            }}
            placeholder={
              MODAL_REGISTRAR_MODULO_PLACEHOLDERS
                .descripcion
            }
            error={errors.descripcion}
            rows={3}
          />

          <SisgesIconPicker
            id="modulo-icono"
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
            onChange={onIconoChange}
            error={errors.icono}
          />

          <SelectField<number>
            label={
              MODAL_REGISTRAR_MODULO_LABELS
                .padre
            }
            layout="inline"
            value={form.padreId}
            options={parentOptions}
            onChange={onPadreChange}
            error={errors.padreId}
            disabled={parentDisabled}
            hidePlaceholder
          />

          {orderControl}

          <SelectField<boolean>
            label={
              MODAL_REGISTRAR_MODULO_LABELS
                .visible
            }
            layout="inline"
            value={form.visible}
            options={
              MODAL_REGISTRAR_MODULO_VISIBLE_OPTIONS
            }
            onChange={onVisibleChange}
            error={errors.visible}
            disabled={visibleDisabled}
            hidePlaceholder
          />

          <SelectField<boolean>
            label={
              MODAL_REGISTRAR_MODULO_LABELS
                .estado
            }
            layout="inline"
            value={form.estado}
            options={
              MODAL_REGISTRAR_MODULO_ESTADO_OPTIONS
            }
            onChange={onEstadoChange}
            error={errors.estado}
            hidePlaceholder
          />
        </div>
      </section>
    </div>
  );
};

export default ModuloFormFields;
