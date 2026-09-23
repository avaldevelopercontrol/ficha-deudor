import type React from 'react';

import MantenerBiTableCard from '../modules/mantener-bi/components/MantenerBiTableCard';

import '../styles/32-mantener-bi.css';

export const MantenerBiPage: React.FC = () => {
  return (
    <div className="mantener-bi-page">
      <div className="mantener-bi-page__content">
        <MantenerBiTableCard />
      </div>
    </div>
  );
};

export default MantenerBiPage;
