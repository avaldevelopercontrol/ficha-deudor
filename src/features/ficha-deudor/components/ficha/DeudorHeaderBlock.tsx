import React from 'react';
import type { DeudorInfo } from '../../types';

interface Props {
  data: DeudorInfo;
}

const DeudorHeaderBlock: React.FC<Props> = ({ data }) => {
  return (
    <div className="deudor-header-inline">
      <span className="label">DEUDOR:</span>
      <span className="value value--highlight">{data.nombreRazonSocial}</span>
      <span className="divider">|</span>
      <span className="label">RUC/DNI:</span>
      <span className="value">{data.dniRuc}</span>
    </div>
  );
};

export default DeudorHeaderBlock;