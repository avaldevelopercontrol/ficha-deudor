import type React from 'react';

import { ClienteSelectorModal, LoginForm } from '../components';
import { useLoginPage } from '../shell/hooks/useLoginPage';

export const LoginPage: React.FC = () => {
  const { loginFormProps, clienteSelectorProps } = useLoginPage();

  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__brand">
          <span className="login-page__logo-text">AVAL</span>
          <span className="login-page__logo-sub">PERÚ</span>
        </div>

        <LoginForm {...loginFormProps} />
      </div>

      {clienteSelectorProps.isOpen && clienteSelectorProps.usuario && (
        <ClienteSelectorModal
          isOpen={clienteSelectorProps.isOpen}
          usuario={clienteSelectorProps.usuario}
          onClose={clienteSelectorProps.onClose}
          onContinue={clienteSelectorProps.onContinue}
        />
      )}
    </div>
  );
};

export default LoginPage;
