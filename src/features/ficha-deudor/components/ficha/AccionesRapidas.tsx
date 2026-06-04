import React from 'react';
import { botonesEstaticos } from '../../mocks/mockData';

interface Props {
  panelActivo: string | null;
  onTogglePanel: (accion: string) => void;
}

const AccionesRapidas: React.FC<Props> = ({ panelActivo, onTogglePanel }) => {
  const handleAccionClick = (accion: string) => {
    onTogglePanel(accion);
  };

  return (
    <div className="ficha-card acciones-rapidas">
      <div className="acciones-rapidas-header">
        <span className="acciones-rapidas-title">ACCIONES RÁPIDAS</span>
      </div>
      <div className="botones-estaticos">
        {botonesEstaticos.map((btn) => (
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