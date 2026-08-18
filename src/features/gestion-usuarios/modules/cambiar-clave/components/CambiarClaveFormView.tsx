import type React from 'react';

import {
  ActionButton,
  FeedbackMessage,
  OperationFeedbackMessage,
  PasswordField,
} from '@shared/components/ui';
import type {
  OperationFeedback,
} from '@shared/feedback/operationFeedback';

import {
  CAMBIAR_CLAVE_HISTORY_NOTICE,
  CAMBIAR_CLAVE_PASSWORD_MAX_LENGTH,
  CAMBIAR_CLAVE_REQUIREMENTS,
  CAMBIAR_CLAVE_TEXTS,
} from '../../constants/cambiarClave.constants';

import type {
  CambiarClaveField,
  CambiarClaveFormData,
} from '../../../types/cambiarClave.types';

import type {
  CambiarClaveRequirementStatus,
} from '../validations/cambiarClave.validation';

const RequirementCheckIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m5 10 3 3 7-7" />
  </svg>
);

const HistoryNoticeIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="7" />
    <path d="M10 9v5" />
    <path d="M10 6.2h.01" />
  </svg>
);

interface CambiarClaveFormViewProps {
  form: CambiarClaveFormData;
  requirementStatus: CambiarClaveRequirementStatus;
  canEdit: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  successFeedback: OperationFeedback | null;
  clearSuccessFeedback: () => void;
  getFieldError: (
    field: CambiarClaveField
  ) => string | undefined;
  handleChange: (
    field: CambiarClaveField,
    value: string
  ) => void;
  handleBlur: (field: CambiarClaveField) => void;
  handleSubmit: () => void | Promise<void>;
  title?: string;
  description?: string;
  formAriaLabel?: string;
  submitLabel?: string;
  submittingLabel?: string;
  editPermissionDeniedMessage?: string;
}

export const CambiarClaveFormView: React.FC<
  CambiarClaveFormViewProps
> = ({
  form,
  requirementStatus,
  canEdit,
  canSubmit,
  isSubmitting,
  submitError,
  successFeedback,
  clearSuccessFeedback,
  getFieldError,
  handleChange,
  handleBlur,
  handleSubmit,
  title = 'Datos de seguridad',
  description = 'Complete los campos solicitados para actualizar su clave de acceso.',
  formAriaLabel = 'Formulario para cambiar clave',
  submitLabel = CAMBIAR_CLAVE_TEXTS.submitLabel,
  submittingLabel = CAMBIAR_CLAVE_TEXTS.submittingLabel,
  editPermissionDeniedMessage = CAMBIAR_CLAVE_TEXTS.editPermissionDenied,
}) => (
  <section
    className="cambiar-clave-card"
    aria-labelledby="cambiar-clave-title"
    aria-busy={isSubmitting}
  >
    <header className="cambiar-clave-card__header">
      <h1
        id="cambiar-clave-title"
        className="cambiar-clave-card__title"
      >
        {title}
      </h1>

      <p className="cambiar-clave-card__description">
        {description}
      </p>
    </header>

    <div className="cambiar-clave-card__content">
      <div
        className="cambiar-clave-form"
        aria-label={formAriaLabel}
      >
        <PasswordField
          id="clave-actual"
          name="claveActual"
          label="Ingresar clave actual :"
          placeholder="Ingrese su clave actual"
          autoComplete="current-password"
          maxLength={CAMBIAR_CLAVE_PASSWORD_MAX_LENGTH}
          value={form.claveActual}
          error={getFieldError('claveActual')}
          disabled={isSubmitting}
          onChange={(event) =>
            handleChange('claveActual', event.target.value)
          }
          onBlur={() => handleBlur('claveActual')}
        />

        <PasswordField
          id="clave-nueva"
          name="claveNueva"
          label="Ingresar clave nueva :"
          placeholder="Ingrese su nueva clave"
          autoComplete="new-password"
          maxLength={CAMBIAR_CLAVE_PASSWORD_MAX_LENGTH}
          value={form.claveNueva}
          error={getFieldError('claveNueva')}
          disabled={isSubmitting}
          onChange={(event) =>
            handleChange('claveNueva', event.target.value)
          }
          onBlur={() => handleBlur('claveNueva')}
        />

        <PasswordField
          id="confirmar-clave-nueva"
          name="confirmarClaveNueva"
          label="Confirmar clave nueva :"
          placeholder="Confirme su nueva clave"
          autoComplete="new-password"
          maxLength={CAMBIAR_CLAVE_PASSWORD_MAX_LENGTH}
          value={form.confirmarClaveNueva}
          error={getFieldError('confirmarClaveNueva')}
          disabled={isSubmitting}
          onChange={(event) =>
            handleChange(
              'confirmarClaveNueva',
              event.target.value
            )
          }
          onBlur={() => handleBlur('confirmarClaveNueva')}
        />

        {(submitError || successFeedback) && (
          <div className="cambiar-clave-form__feedback">
            {submitError && (
              <FeedbackMessage
                variant="error"
                title={CAMBIAR_CLAVE_TEXTS.errorTitle}
                message={submitError}
              />
            )}

            <OperationFeedbackMessage
              feedback={successFeedback}
              onClose={clearSuccessFeedback}
            />
          </div>
        )}

        <div className="cambiar-clave-form__actions">
          <ActionButton
            label={submitLabel}
            loadingLabel={submittingLabel}
            loading={isSubmitting}
            disabled={isSubmitting || !canSubmit}
            title={
              canEdit
                ? undefined
                : editPermissionDeniedMessage
            }
            variant="primary"
            size="md"
            onClick={handleSubmit}
          />
        </div>
      </div>

      <aside
        className="cambiar-clave-requirements"
        aria-labelledby="clave-requisitos-title"
      >
        <h2
          id="clave-requisitos-title"
          className="cambiar-clave-requirements__title"
        >
          La clave debe contener:
        </h2>

        <ul className="cambiar-clave-requirements__list">
          {CAMBIAR_CLAVE_REQUIREMENTS.map((requirement) => {
            const isMet = requirementStatus[requirement.id];

            return (
              <li
                key={requirement.id}
                className={
                  isMet
                    ? 'cambiar-clave-requirements__item cambiar-clave-requirements__item--valid'
                    : 'cambiar-clave-requirements__item cambiar-clave-requirements__item--pending'
                }
                aria-label={`${requirement.label} ${
                  isMet ? 'Requisito cumplido.' : 'Requisito pendiente.'
                }`}
              >
                <span
                  className="cambiar-clave-requirements__icon"
                  aria-hidden="true"
                >
                  {isMet && <RequirementCheckIcon />}
                </span>

                <span>{requirement.label}</span>
              </li>
            );
          })}
        </ul>

        <div className="cambiar-clave-requirements__notice">
          <span
            className="cambiar-clave-requirements__notice-icon"
            aria-hidden="true"
          >
            <HistoryNoticeIcon />
          </span>

          <span>{CAMBIAR_CLAVE_HISTORY_NOTICE}</span>
        </div>
      </aside>
    </div>
  </section>
);

export default CambiarClaveFormView;
