import type React from 'react';

import MantenerModulosTableCard from '../modules/mantener-modulos/components/MantenerModulosTableCard';

import '../styles/28-mantener-modulos.css';

export const MantenerModulosPage: React.FC = () => {
  return (
    <div className="mantener-modulos-page">
      <div className="mantener-modulos-page__content">
        <MantenerModulosTableCard />
      </div>
    </div>
  );
};

export default MantenerModulosPage;
