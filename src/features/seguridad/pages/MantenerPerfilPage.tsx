import type React from 'react';

import MantenerPerfilTableCard from '../modules/mantener-perfil/components/MantenerPerfilTableCard';

import '../styles/27-mantener-perfil.css';

export const MantenerPerfilPage: React.FC = () => {
  return (
    <div className="mantener-perfil-page">
      <div className="mantener-perfil-page__content">
        <MantenerPerfilTableCard />
      </div>
    </div>
  );
};

export default MantenerPerfilPage;