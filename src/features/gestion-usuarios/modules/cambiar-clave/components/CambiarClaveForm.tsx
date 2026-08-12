import type React from 'react';

import {
  ActionButton,
  FeedbackMessage,
  OperationFeedbackMessage,
  PasswordField,
} from '@shared/components/ui';

import {
  CAMBIAR_CLAVE_HISTORY_NOTICE,
  CAMBIAR_CLAVE_PASSWORD_MAX_LENGTH,
  CAMBIAR_CLAVE_REQUIREMENTS,
  CAMBIAR_CLAVE_TEXTS,
} from '../../constants/cambiarClave.constants';

import {
  useCambiarClaveForm,
} from '../hooks/useCambiarClaveForm';

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

export const CambiarClaveForm: React.FC = () => {
  const {
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
  } = useCambiarClaveForm();

  return (
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
          Datos de seguridad
        </h1>

        <p className="cambiar-clave-card__description">
          Complete los campos solicitados para actualizar su clave de acceso.
        </p>
      </header>

      <div className="cambiar-clave-card__content">
        <div
          className="cambiar-clave-form"
          aria-label="Formulario para cambiar clave"
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
              label={CAMBIAR_CLAVE_TEXTS.submitLabel}
              loadingLabel={CAMBIAR_CLAVE_TEXTS.submittingLabel}
              loading={isSubmitting}
              disabled={isSubmitting || !canSubmit}
              title={
                canEdit
                  ? undefined
                  : CAMBIAR_CLAVE_TEXTS.editPermissionDenied
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
};

export default CambiarClaveForm;
