import type React from 'react';

import MantenerGrupoTableCard from '../modules/mantener-grupo/components/MantenerGrupoTableCard';

import '../styles/30-mantener-grupo.css';

export const MantenerGrupoPage: React.FC = () => {
  return (
    <div className="mantener-grupo-page">
      <div className="mantener-grupo-page__content">
        <MantenerGrupoTableCard />
      </div>
    </div>
  );
};

export default MantenerGrupoPage;
