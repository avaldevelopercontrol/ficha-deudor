import type React from 'react';

import { InputField, PasswordField } from '@shared/components/ui';

import type { LoginPayload } from '../../../types';
import { useLoginForm } from '../hooks/useLoginForm';

interface LoginFormProps {
  onSubmit: (payload: LoginPayload) => void;
  isLoading: boolean;
  error?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  error,
}) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useLoginForm({ onSubmit });

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="login-form__header">
        <h2 className="login-form__title">Iniciar Sesión</h2>
        <p className="login-form__subtitle">Sistema de Gestión de Cobranzas</p>
      </div>

      <div className="login-form__body">
        <InputField
          label="Usuario"
          placeholder="Ingrese su usuario"
          value={values.username}
          onChange={(event) => handleChange('username')(event.target.value)}
          onBlur={handleBlur('username')}
          error={touched.username ? errors.username : undefined}
          autoComplete="username"
          autoFocus
          required
        />

        <PasswordField
          label="Contraseña"
          placeholder="Ingrese su contraseña"
          value={values.password}
          onChange={(event) => handleChange('password')(event.target.value)}
          onBlur={handleBlur('password')}
          error={touched.password ? errors.password : undefined}
          autoComplete="current-password"
          required
        />

        {error && (
          <div className="login-form__error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}
      </div>

      <div className="login-form__footer">
        <button
          type="submit"
          className="btn btn-primary2 btn-md login-form__submit"
          disabled={isLoading}
        >
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>
    </form>
  );
};
