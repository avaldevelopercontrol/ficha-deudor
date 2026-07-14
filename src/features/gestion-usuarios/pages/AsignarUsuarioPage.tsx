import type React from 'react';

import AsignarUsuarioTableCard from '../modules/asignar-usuario/components/AsignarUsuarioTableCard';

import '../styles/25-asignar-usuario.css';

export const AsignarUsuarioPage: React.FC = () => {
  return (
    <div className="asignar-usuario-page">
      <div className="asignar-usuario-page__content">
        <AsignarUsuarioTableCard />
      </div>
    </div>
  );
};

export default AsignarUsuarioPage;