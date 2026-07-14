import type React from 'react';

import CambiarClaveForm from '../modules/cambiar-clave/components/CambiarClaveForm';

import '../styles/24-cambiar-clave.css';

export const CambiarClavePage: React.FC = () => {
  return (
    <div className="cambiar-clave-page">
      <main className="cambiar-clave-page__main">
        <CambiarClaveForm />
      </main>
    </div>
  );
};

export default CambiarClavePage;