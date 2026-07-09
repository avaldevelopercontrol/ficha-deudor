import React from 'react';

import {
  FICHA_DEUDOR_PANEL_OPTIONS,
  type FichaDeudorPanel,
} from '../constants/fichaDeudorPanels.constants';

interface Props {
  panelActivo: FichaDeudorPanel | null;
  onTogglePanel: (accion: FichaDeudorPanel) => void;
}

const AccionesRapidas: React.FC<Props> = ({ panelActivo, onTogglePanel }) => {
  const handleAccionClick = (accion: FichaDeudorPanel) => {
    onTogglePanel(accion);
  };

  return (
    <div className="ficha-card acciones-rapidas">
      <div className="acciones-rapidas-header">
        <span className="acciones-rapidas-title">ACCIONES RÁPIDAS</span>
      </div>

      <div className="botones-estaticos">
        {FICHA_DEUDOR_PANEL_OPTIONS.map((btn) => (
          <button
            key={btn}
            className={`btn-est ${panelActivo === btn ? 'btn-est--active' : ''}`}
            type="button"
            onClick={() => handleAccionClick(btn)}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccionesRapidas;