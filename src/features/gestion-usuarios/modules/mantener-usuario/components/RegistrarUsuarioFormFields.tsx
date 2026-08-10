import type React from 'react';

import {
  CheckboxField,
  InputField,
  PasswordField,
  SelectField,
} from '@shared/components/ui';

import {
  MODAL_REGISTRAR_USUARIO_LABELS,
  MODAL_REGISTRAR_USUARIO_LIMITS,
  MODAL_REGISTRAR_USUARIO_PLACEHOLDERS,
  MODAL_REGISTRAR_USUARIO_SECTIONS,
} from '../constants/modalRegistrarUsuario.constants';

import type {
  RegistrarUsuarioCatalogos,
  RegistrarUsuarioFieldChange,
  RegistrarUsuarioFormData,
  RegistrarUsuarioCatalogErrors,
  RegistrarUsuarioCatalogLoading,
  SexoUsuarioValue,
} from '../types/registrarUsuario.types';

interface RegistrarUsuarioFormFieldsProps {
  form:
    RegistrarUsuarioFormData;

  errors:
    Record<string, string>;

  catalogos:
    RegistrarUsuarioCatalogos;

  catalogLoading:
    RegistrarUsuarioCatalogLoading;

  catalogErrors:
    RegistrarUsuarioCatalogErrors;

  onChange:
    RegistrarUsuarioFieldChange;
}

const onlyDigits = (
  value: string,
  maxLength: number
): string =>
  value
    .replace(/\D/g, '')
    .slice(0, maxLength);

export const RegistrarUsuarioFormFields:
  React.FC<RegistrarUsuarioFormFieldsProps> = ({
    form,
    errors,
    catalogos,
    catalogLoading,
    catalogErrors,
    onChange,
  }) => {
    const today = new Date();

    const maxDate = new Date(
      today.getTime() -
        today.getTimezoneOffset() *
          60_000
    )
      .toISOString()
      .slice(0, 10);

    const getCatalogPlaceholder = (
      isLoading: boolean
    ): string =>
      isLoading
        ? MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
            .loading
        : MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
            .select;

    return (
      <div className="registrar-usuario-form">
        {/* Datos personales */}
        <section className="registrar-usuario-form__section">
          <h2 className="registrar-usuario-form__section-title">
            {
              MODAL_REGISTRAR_USUARIO_SECTIONS
                .personal
            }
          </h2>

          <div className="registrar-usuario-form__grid">
            <InputField
              id="registrar-usuario-dni"
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .dni
              }
              layout="inline"
              value={form.dni}
              onChange={(event) => {
                onChange(
                  'dni',
                  onlyDigits(
                    event.target.value,
                    MODAL_REGISTRAR_USUARIO_LIMITS
                      .dni
                  )
                );
              }}
              placeholder={
                MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
                  .dni
              }
              inputMode="numeric"
              autoComplete="off"
              maxLength={
                MODAL_REGISTRAR_USUARIO_LIMITS
                  .dni
              }
              error={errors.dni}
              required
            />

            <InputField
              id="registrar-usuario-nombre"
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .nombre
              }
              layout="inline"
              value={form.nombre}
              onChange={(event) => {
                onChange(
                  'nombre',
                  event.target.value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
                  .nombre
              }
              autoComplete="given-name"
              maxLength={
                MODAL_REGISTRAR_USUARIO_LIMITS
                  .nombre
              }
              error={errors.nombre}
              required
            />

            <InputField
              id="registrar-usuario-apellido-paterno"
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .apellidoPaterno
              }
              layout="inline"
              value={
                form.apellidoPaterno
              }
              onChange={(event) => {
                onChange(
                  'apellidoPaterno',
                  event.target.value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
                  .apellidoPaterno
              }
              autoComplete="family-name"
              maxLength={
                MODAL_REGISTRAR_USUARIO_LIMITS
                  .apellido
              }
              error={
                errors.apellidoPaterno
              }
              required
            />

            <InputField
              id="registrar-usuario-apellido-materno"
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .apellidoMaterno
              }
              layout="inline"
              value={
                form.apellidoMaterno
              }
              onChange={(event) => {
                onChange(
                  'apellidoMaterno',
                  event.target.value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
                  .apellidoMaterno
              }
              autoComplete="additional-name"
              maxLength={
                MODAL_REGISTRAR_USUARIO_LIMITS
                  .apellido
              }
              error={
                errors.apellidoMaterno
              }
              required
            />

            <InputField
              id="registrar-usuario-fecha-nacimiento"
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .fechaNacimiento
              }
              layout="inline"
              type="date"
              value={
                form.fechaNacimiento
              }
              onChange={(event) => {
                onChange(
                  'fechaNacimiento',
                  event.target.value
                );
              }}
              max={maxDate}
              error={
                errors.fechaNacimiento
              }
              required
            />

            <SelectField<SexoUsuarioValue>
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .sexo
              }
              layout="inline"
              value={form.sexo}
              options={catalogos.sexos}
              onChange={(value) => {
                onChange(
                  'sexo',
                  value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
                  .select
              }
              error={errors.sexo}
              required
            />
          </div>
        </section>

        {/* Acceso y asignación */}
        <section className="registrar-usuario-form__section">
          <h2 className="registrar-usuario-form__section-title">
            {
              MODAL_REGISTRAR_USUARIO_SECTIONS
                .access
            }
          </h2>

          <div className="registrar-usuario-form__grid">
            <InputField
              id="registrar-usuario-login"
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .usuario
              }
              layout="inline"
              value={form.usuario}
              onChange={(event) => {
                onChange(
                  'usuario',
                  event.target.value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
                  .usuario
              }
              autoComplete="username"
              maxLength={
                MODAL_REGISTRAR_USUARIO_LIMITS
                  .usuario
              }
              error={errors.usuario}
              required
            />

            <PasswordField
              id="registrar-usuario-contrasena"
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .contrasena
              }
              layout="inline"
              value={
                form.contrasena
              }
              onChange={(event) => {
                onChange(
                  'contrasena',
                  event.target.value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
                  .contrasena
              }
              autoComplete="new-password"
              maxLength={
                MODAL_REGISTRAR_USUARIO_LIMITS
                  .contrasena
              }
              error={
                errors.contrasena
              }
              required
            />

            <SelectField
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .perfil
              }
              layout="inline"
              value={form.perfil}
              options={catalogos.perfiles}
              onChange={(value) => {
                onChange(
                  'perfil',
                  value
                );
              }}
              placeholder={
                getCatalogPlaceholder(
                  catalogLoading.perfiles
                )
              }
              error={
                errors.perfil ||
                catalogErrors.perfiles ||
                ''
              }
              disabled={
                catalogLoading.perfiles
              }
            />

            <SelectField
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .grupo
              }
              layout="inline"
              value={form.grupo}
              options={catalogos.grupos}
              onChange={(value) => {
                onChange(
                  'grupo',
                  value
                );
              }}
              placeholder={
                getCatalogPlaceholder(
                  catalogLoading.grupos
                )
              }
              error={
                errors.grupo ||
                catalogErrors.grupos ||
                ''
              }
              disabled={
                catalogLoading.grupos
              }
            />

            <SelectField<boolean>
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .estado
              }
              layout="inline"
              value={form.estado}
              options={catalogos.estados}
              onChange={(value) => {
                onChange(
                  'estado',
                  value
                );
              }}
              hidePlaceholder
            />

            <div className="form-row-inline registrar-usuario-form__checkbox-field">
              <span className="form-label form-label--inline">
                {
                  MODAL_REGISTRAR_USUARIO_LABELS
                    .codigoRecaudador
                }
              </span>

              <div className="registrar-usuario-form__checkbox-control">
                <CheckboxField
                  label="Sí"
                  checked={
                    form.codigoRecaudador
                  }
                  onChange={(checked) => {
                    onChange(
                      'codigoRecaudador',
                      checked
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Información laboral y contacto */}
        <section className="registrar-usuario-form__section">
          <h2 className="registrar-usuario-form__section-title">
            {
              MODAL_REGISTRAR_USUARIO_SECTIONS
                .contact
            }
          </h2>

          <div className="registrar-usuario-form__grid">
            <SelectField
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .departamentoLabor
              }
              layout="inline"
              value={
                form.departamentoLabor
              }
              options={
                catalogos.departamentosLabor
              }
              onChange={(value) => {
                onChange(
                  'departamentoLabor',
                  value
                );
              }}
              placeholder={
                getCatalogPlaceholder(
                  catalogLoading
                    .departamentosLabor
                )
              }
              error={
                errors.departamentoLabor ||
                catalogErrors
                  .departamentosLabor ||
                ''
              }
              disabled={
                catalogLoading
                  .departamentosLabor
              }
              required
            />

            <InputField
              id="registrar-usuario-ciudad-gestor"
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .ciudadGestor
              }
              layout="inline"
              value={
                form.ciudadGestor
              }
              onChange={(event) => {
                onChange(
                  'ciudadGestor',
                  event.target.value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
                  .ciudadGestor
              }
              maxLength={
                MODAL_REGISTRAR_USUARIO_LIMITS
                  .ciudadGestor
              }
              error={
                errors.ciudadGestor
              }
            />

            <SelectField
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .subZonalOficina
              }
              layout="inline"
              value={form.subZonalOficina}
              options={
                catalogos.subZonalesOficina
              }
              onChange={(value) => {
                onChange(
                  'subZonalOficina',
                  value
                );
              }}
              placeholder={
                getCatalogPlaceholder(
                  catalogLoading.subZonalesOficina
                )
              }
              error={
                errors.subZonalOficina ||
                catalogErrors.subZonalesOficina ||
                ''
              }
              disabled={
                catalogLoading.subZonalesOficina
              }
              required
            />

            <InputField
              id="registrar-usuario-movil-empresa"
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .movilEmpresa
              }
              layout="inline"
              value={
                form.movilEmpresa
              }
              onChange={(event) => {
                onChange(
                  'movilEmpresa',
                  onlyDigits(
                    event.target.value,
                    MODAL_REGISTRAR_USUARIO_LIMITS
                      .movilEmpresa
                  )
                );
              }}
              placeholder={
                MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
                  .movilEmpresa
              }
              inputMode="numeric"
              autoComplete="tel"
              maxLength={
                MODAL_REGISTRAR_USUARIO_LIMITS
                  .movilEmpresa
              }
              error={
                errors.movilEmpresa
              }
            />

            <InputField
              id="registrar-usuario-anexo"
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .anexo
              }
              layout="inline"
              value={form.anexo}
              onChange={(event) => {
                onChange(
                  'anexo',
                  onlyDigits(
                    event.target.value,
                    MODAL_REGISTRAR_USUARIO_LIMITS
                      .anexo
                  )
                );
              }}
              placeholder={
                MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
                  .anexo
              }
              inputMode="numeric"
              maxLength={
                MODAL_REGISTRAR_USUARIO_LIMITS
                  .anexo
              }
              error={errors.anexo}
              required
            />

            <InputField
              id="registrar-usuario-email-empresa"
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .emailEmpresa
              }
              layout="inline"
              type="email"
              value={
                form.emailEmpresa
              }
              onChange={(event) => {
                onChange(
                  'emailEmpresa',
                  event.target.value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
                  .emailEmpresa
              }
              autoComplete="email"
              maxLength={
                MODAL_REGISTRAR_USUARIO_LIMITS
                  .email
              }
              error={
                errors.emailEmpresa
              }
            />

            <InputField
              id="registrar-usuario-email-personal"
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .emailPersonal
              }
              layout="inline"
              type="email"
              value={
                form.emailPersonal
              }
              onChange={(event) => {
                onChange(
                  'emailPersonal',
                  event.target.value
                );
              }}
              placeholder={
                MODAL_REGISTRAR_USUARIO_PLACEHOLDERS
                  .emailPersonal
              }
              autoComplete="email"
              maxLength={
                MODAL_REGISTRAR_USUARIO_LIMITS
                  .email
              }
              error={
                errors.emailPersonal
              }
            />

            <SelectField
              label={
                MODAL_REGISTRAR_USUARIO_LABELS
                  .campanaDiscador
              }
              layout="inline"
              value={
                form.campanaDiscador
              }
              options={
                catalogos.campanasDiscador
              }
              onChange={(value) => {
                onChange(
                  'campanaDiscador',
                  value
                );
              }}
              placeholder={
                getCatalogPlaceholder(
                  catalogLoading
                    .campanasDiscador
                )
              }
              error={
                errors.campanaDiscador ||
                catalogErrors
                  .campanasDiscador ||
                ''
              }
              disabled={
                catalogLoading
                  .campanasDiscador
              }
            />
          </div>
        </section>
      </div>
    );
  };

export default RegistrarUsuarioFormFields;