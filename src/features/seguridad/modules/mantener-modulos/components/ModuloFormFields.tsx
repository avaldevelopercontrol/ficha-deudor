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

import PowerBiImagePicker from './PowerBiImagePicker';

import type {
  SelectOption,
} from '@shared/types';

import {
  MODAL_REGISTRAR_MODULO_ESTADO_OPTIONS,
  MODAL_REGISTRAR_MODULO_HELP,
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
  nameDisabled?: boolean;
  codeDisabled?: boolean;
  parentDisabled?: boolean;
  visibleDisabled?: boolean;
  powerBiDisabled?: boolean;
  powerBiDisabledMessage?: string;
  showPowerBiTypeSelector?: boolean;
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
  onEsPowerBIChange?: (
    value: boolean
  ) => void;
  onUrlBIChange: (
    value: string
  ) => void;
  onImagenOpcionChange: (
    value: string
  ) => void;
  onEmailOpcionChange?: (
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
  nameDisabled = false,
  codeDisabled = false,
  parentDisabled = false,
  visibleDisabled = false,
  powerBiDisabled = false,
  powerBiDisabledMessage,
  showPowerBiTypeSelector = true,
  orderControl,
  onNombreChange,
  onDescripcionChange,
  onCodigoChange,
  onIconoChange,
  onEsPowerBIChange,
  onUrlBIChange,
  onImagenOpcionChange,
  onEmailOpcionChange,
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
            disabled={nameDisabled}
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
            disabled={codeDisabled}
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

          {showPowerBiTypeSelector && (
            <div className="registrar-modulo-form__power-bi-row">
              <span className="form-label form-label--inline">
                {
                  MODAL_REGISTRAR_MODULO_LABELS
                    .esPowerBI
                }
              </span>

              <div className="registrar-modulo-form__power-bi-control">
                <label
                  className={[
                    'registrar-modulo-form__power-bi-toggle',
                    powerBiDisabled
                      ? 'registrar-modulo-form__power-bi-toggle--disabled'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <input
                    type="checkbox"
                    checked={form.esPowerBI}
                    disabled={powerBiDisabled}
                    onChange={(event) => {
                      onEsPowerBIChange?.(
                        event.target.checked
                      );
                    }}
                  />
                  <span>
                    Tablero Power BI
                  </span>
                </label>

                {powerBiDisabled &&
                  powerBiDisabledMessage && (
                    <small className="registrar-modulo-form__field-help">
                      {powerBiDisabledMessage}
                    </small>
                  )}

                {errors.esPowerBI && (
                  <span className="form-error">
                    {errors.esPowerBI}
                  </span>
                )}
              </div>
            </div>
          )}

          {form.esPowerBI && (
            <>
              <InputField
                id="modulo-url-bi"
                label={
                  MODAL_REGISTRAR_MODULO_LABELS
                    .urlBI
                }
                layout="inline"
                value={form.urlBI}
                onChange={(event) => {
                  onUrlBIChange(
                    event.target.value
                  );
                }}
                placeholder={
                  MODAL_REGISTRAR_MODULO_PLACEHOLDERS
                    .urlBI
                }
                error={errors.urlBI}
                autoComplete="off"
                inputMode="url"
                required
              />

              <InputField
                id="modulo-email-opcion"
                label={
                  MODAL_REGISTRAR_MODULO_LABELS
                    .emailOpcion
                }
                layout="inline"
                type="email"
                value={form.emailOpcion ?? ''}
                onChange={(event) => {
                  onEmailOpcionChange?.(
                    event.target.value
                  );
                }}
                placeholder={
                  MODAL_REGISTRAR_MODULO_PLACEHOLDERS
                    .emailOpcion
                }
                error={errors.emailOpcion}
                autoComplete="email"
                inputMode="email"
                required
              />

              <div className="registrar-modulo-form__image-field">
                <PowerBiImagePicker
                  id="modulo-imagen-opcion"
                  label={
                    MODAL_REGISTRAR_MODULO_LABELS
                      .imagenOpcion
                  }
                  value={form.imagenOpcion}
                  onChange={
                    onImagenOpcionChange
                  }
                  error={errors.imagenOpcion}
                />

                <div className="registrar-modulo-form__image-help">
                  {
                    MODAL_REGISTRAR_MODULO_HELP
                      .imagenOpcion
                  }
                </div>
              </div>
            </>
          )}

          {!form.esPowerBI && (
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
          )}

          <div>
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

            {form.esPowerBI && (
              <div className="registrar-modulo-form__parent-help">
                {
                  MODAL_REGISTRAR_MODULO_HELP
                    .powerBIParent
                }
              </div>
            )}
          </div>

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
