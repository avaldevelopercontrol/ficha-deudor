import type React from 'react';

import {
  InputField,
  SelectField,
} from '@shared/components/ui';

import type {
  SelectOption,
} from '@shared/types';

import {
  MODAL_REGISTRAR_GRUPO_ESTADO_OPTIONS,
  MODAL_REGISTRAR_GRUPO_LABELS,
  MODAL_REGISTRAR_GRUPO_PLACEHOLDERS,
  MODAL_REGISTRAR_GRUPO_SECTIONS,
} from '../constants/modalRegistrarGrupo.constants';

import type {
  RegistrarGrupoEstado,
  RegistrarGrupoFieldChange,
  RegistrarGrupoFormData,
} from '../types/registrarGrupo.types';

interface RegistrarGrupoFormFieldsProps {
  form:
    RegistrarGrupoFormData;

  errors:
    Record<string, string>;

  clienteOptions:
    SelectOption<number>[];

  disabled?: boolean;

  onChange:
    RegistrarGrupoFieldChange;
}

export const RegistrarGrupoFormFields:
  React.FC<
    RegistrarGrupoFormFieldsProps
  > = ({
    form,
    errors,
    clienteOptions,
    disabled = false,
    onChange,
  }) => {
    return (
      <div className="registrar-grupo-form">
        <section className="registrar-grupo-form__section">
          <h2 className="registrar-grupo-form__section-title">
            {
              MODAL_REGISTRAR_GRUPO_SECTIONS
                .general
            }
          </h2>

          <div className="registrar-grupo-form__grid">
            <InputField
              id="registrar-grupo-nombre"
              label={
                MODAL_REGISTRAR_GRUPO_LABELS
                  .nombre
              }
              layout="inline"
              value={form.nombre}
              onChange={(
                event
              ) => {
                onChange(
                  'nombre',
                  event.target.value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_GRUPO_PLACEHOLDERS
                  .nombre
              }
              error={errors.nombre}
              autoComplete="off"
              disabled={disabled}
              required
            />

            <InputField
              id="registrar-grupo-sigla"
              label={
                MODAL_REGISTRAR_GRUPO_LABELS
                  .sigla
              }
              layout="inline"
              value={form.sigla}
              onChange={(
                event
              ) => {
                onChange(
                  'sigla',
                  event.target.value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_GRUPO_PLACEHOLDERS
                  .sigla
              }
              error={errors.sigla}
              autoComplete="off"
              disabled={disabled}
              required
            />

            <SelectField<
              number | ''
            >
              label={
                MODAL_REGISTRAR_GRUPO_LABELS
                  .cliente
              }
              layout="inline"
              value={form.clienteId}
              options={clienteOptions}
              onChange={(
                value
              ) => {
                onChange(
                  'clienteId',
                  value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_GRUPO_PLACEHOLDERS
                  .cliente
              }
              error={errors.clienteId}
              disabled={disabled}
              required
            />

            <SelectField<
              RegistrarGrupoEstado
            >
              label={
                MODAL_REGISTRAR_GRUPO_LABELS
                  .estado
              }
              layout="inline"
              value={form.estado}
              options={
                MODAL_REGISTRAR_GRUPO_ESTADO_OPTIONS
              }
              onChange={(
                value
              ) => {
                onChange(
                  'estado',
                  value
                );
              }}
              error={errors.estado}
              disabled={disabled}
              hidePlaceholder
            />
          </div>
        </section>
      </div>
    );
  };

export default RegistrarGrupoFormFields;
