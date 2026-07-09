import type React from 'react';
import { GestionDeudorSearchCard } from '../modules/busqueda/components/GestionDeudorSearchCard';
import { GestionDeudorResultsCard } from '../modules/listado/components/GestionDeudorResultsCard';
import { useGestionDeudorPage } from '../shell/hooks/useGestionDeudorPage';

import '../styles/22-gestion-deudor.css';

export const GestionDeudorPage: React.FC = () => {
  const { searchProps, resultsProps } = useGestionDeudorPage();

  return (
    <div className="gestion-deudor-page">
      <main className="gestion-deudor-main">
        <GestionDeudorSearchCard {...searchProps} />
        <GestionDeudorResultsCard {...resultsProps} />
      </main>
    </div>
  );
};

export default GestionDeudorPage;
