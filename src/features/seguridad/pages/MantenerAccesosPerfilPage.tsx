import type React from 'react';

import MantenerAccesosPerfilTableCard from '../modules/mantener-accesos-perfil/components/MantenerAccesosPerfilTableCard';

import '../styles/29-mantener-accesos-perfil.css';

export const MantenerAccesosPerfilPage: React.FC = () => {
  return (
    <div className="mantener-accesos-perfil-page">
      <div className="mantener-accesos-perfil-page__content">
        <MantenerAccesosPerfilTableCard />
      </div>
    </div>
  );
};

export default MantenerAccesosPerfilPage;
