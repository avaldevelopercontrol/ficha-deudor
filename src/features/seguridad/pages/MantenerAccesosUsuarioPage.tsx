import type React from 'react';

import MantenerAccesosUsuarioTableCard from '../modules/mantener-accesos-usuario/components/MantenerAccesosUsuarioTableCard';

import '../styles/29-mantener-accesos-perfil.css';
import '../styles/31-mantener-accesos-usuario.css';

export const MantenerAccesosUsuarioPage: React.FC = () => {
  return (
    <div className="mantener-accesos-usuario-page">
      <div className="mantener-accesos-usuario-page__content">
        <MantenerAccesosUsuarioTableCard />
      </div>
    </div>
  );
};

export default MantenerAccesosUsuarioPage;
