import type React from 'react';

import CambiarClaveExpiradaForm from '../modules/cambiar-clave-expirada/components/CambiarClaveExpiradaForm';

import '../styles/24-cambiar-clave.css';

export const CambiarClaveExpiradaPage: React.FC = () => {
  return (
    <div className="cambiar-clave-page cambiar-clave-page--public">
      <div className="cambiar-clave-page__public-shell">
        <div className="cambiar-clave-page__public-brand">
          <span className="login-page__logo-text">AVAL</span>
          <span className="login-page__logo-sub">PERÚ</span>
        </div>

        <main className="cambiar-clave-page__main cambiar-clave-page__main--public">
          <CambiarClaveExpiradaForm />
        </main>
      </div>
    </div>
  );
};

export default CambiarClaveExpiradaPage;
