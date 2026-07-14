import type React from 'react';

import {
  ActionButton,
  PasswordField,
} from '@shared/components/ui';

import { CAMBIAR_CLAVE_REQUIREMENTS } from '../../constants/cambiarClave.constants';

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

export const CambiarClaveForm: React.FC = () => {
  return (
    <section
      className="cambiar-clave-card"
      aria-labelledby="cambiar-clave-title"
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
            maxLength={20}
          />

          <PasswordField
            id="clave-nueva"
            name="claveNueva"
            label="Ingresar clave nueva :"
            placeholder="Ingrese su nueva clave"
            autoComplete="new-password"
            maxLength={20}
          />

          <PasswordField
            id="confirmar-clave-nueva"
            name="confirmarClaveNueva"
            label="Confirmar clave nueva :"
            placeholder="Confirme su nueva clave"
            autoComplete="new-password"
            maxLength={20}
          />

          <div className="cambiar-clave-form__actions">
            <ActionButton
              label="Confirmar"
              variant="primary"
              size="md"
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
            {CAMBIAR_CLAVE_REQUIREMENTS.map((requirement) => (
              <li key={requirement}>
                <span
                  className="cambiar-clave-requirements__icon"
                  aria-hidden="true"
                >
                  <RequirementCheckIcon />
                </span>

                <span>{requirement}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
};

export default CambiarClaveForm;