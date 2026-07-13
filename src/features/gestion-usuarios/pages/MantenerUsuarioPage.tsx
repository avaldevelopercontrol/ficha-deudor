import type React from 'react';

import MantenerUsuarioTableCard from '../modules/mantener-usuario/components/MantenerUsuarioTableCard';

import '../styles/26-mantener-usuario.css';

export const MantenerUsuarioPage: React.FC = () => {
  return (
    <div className="mantener-usuario-page">
      <div className="mantener-usuario-page__content">
        <MantenerUsuarioTableCard />
      </div>
    </div>
  );
};

export default MantenerUsuarioPage;