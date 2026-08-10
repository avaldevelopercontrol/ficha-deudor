import type React from 'react';

import {
  InputField,
  SelectField,
} from '@shared/components/ui';

import {
  MODAL_REGISTRAR_PERFIL_ESTADO_OPTIONS,
  MODAL_REGISTRAR_PERFIL_LABELS,
  MODAL_REGISTRAR_PERFIL_LIMITS,
  MODAL_REGISTRAR_PERFIL_PLACEHOLDERS,
  MODAL_REGISTRAR_PERFIL_SECTIONS,
} from '../constants/modalRegistrarPerfil.constants';

import type {
  RegistrarPerfilEstado,
  RegistrarPerfilFieldChange,
  RegistrarPerfilFormData,
} from '../types/registrarPerfil.types';

interface RegistrarPerfilFormFieldsProps {
  form:
    RegistrarPerfilFormData;

  errors:
    Record<string, string>;

  onChange:
    RegistrarPerfilFieldChange;
}

export const RegistrarPerfilFormFields:
  React.FC<
    RegistrarPerfilFormFieldsProps
  > = ({
    form,
    errors,
    onChange,
  }) => {
    return (
      <div className="registrar-perfil-form">
        <section className="registrar-perfil-form__section">
          <h2 className="registrar-perfil-form__section-title">
            {
              MODAL_REGISTRAR_PERFIL_SECTIONS
                .general
            }
          </h2>

          <div className="registrar-perfil-form__grid">
            <InputField
              id="registrar-perfil-nombre"
              label={
                MODAL_REGISTRAR_PERFIL_LABELS
                  .nombrePerfil
              }
              layout="inline"
              value={
                form.nombrePerfil
              }
              onChange={(
                event
              ) => {
                onChange(
                  'nombrePerfil',
                  event.target.value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_PERFIL_PLACEHOLDERS
                  .nombrePerfil
              }
              maxLength={
                MODAL_REGISTRAR_PERFIL_LIMITS
                  .nombrePerfil
              }
              error={
                errors.nombrePerfil
              }
              autoComplete="off"
              required
            />

            <InputField
              id="registrar-perfil-abreviatura"
              label={
                MODAL_REGISTRAR_PERFIL_LABELS
                  .abreviatura
              }
              layout="inline"
              value={
                form.abreviatura
              }
              onChange={(
                event
              ) => {
                onChange(
                  'abreviatura',
                  event.target.value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_PERFIL_PLACEHOLDERS
                  .abreviatura
              }
              maxLength={
                MODAL_REGISTRAR_PERFIL_LIMITS
                  .abreviatura
              }
              error={
                errors.abreviatura
              }
              autoComplete="off"
              required
            />

            <SelectField<
              RegistrarPerfilEstado
            >
              label={
                MODAL_REGISTRAR_PERFIL_LABELS
                  .estado
              }
              layout="inline"
              value={form.estado}
              options={
                MODAL_REGISTRAR_PERFIL_ESTADO_OPTIONS
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

export default RegistrarPerfilFormFields;