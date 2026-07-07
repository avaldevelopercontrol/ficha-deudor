import React from 'react';

import type { DocumentoApi } from '../../../../shared/types/indexApi';
import { useFichaGestionViewModel } from '../../hooks/useFichaGestionViewModel';
import type { GestionFormClaro } from '../../types/fichaGestion.types';
import FichaGestionDatosPrincipales from '../ficha-gestion/FichaGestionDatosPrincipales';
import FichaGestionAccionesTomar from '../ficha-gestion/FichaGestionAccionesTomar';
import FichaGestionResultadosLlamada from '../ficha-gestion/FichaGestionResultadosLlamada';

interface Props {
  idCliente: string;
  idCartera: string;
  idContrato: string;
  idDeudor: string;
  idUsuario: string;
  fechaInicioGestion: string;
  documentosFiltrados: DocumentoApi[];
  telefonoSeleccionado?: string;
  onGestionGuardada?: (gestionTerminada: boolean) => void;
  onSubmit?: (data: GestionFormClaro) => void;
}

const FichaGestion: React.FC<Props> = (props) => {
  const {
    datosPrincipalesProps,
    accionesTomarProps,
    resultadosLlamadaProps,
  } = useFichaGestionViewModel(props);

  return (
    <div className="ficha-card ficha-gestion ficha-gestion--compact">
      <div className="ficha-gestion-header">
        <span className="fg-title">FICHA DE GESTIÓN</span>
      </div>

      <FichaGestionDatosPrincipales {...datosPrincipalesProps} />

      <FichaGestionAccionesTomar {...accionesTomarProps} />

      <FichaGestionResultadosLlamada {...resultadosLlamadaProps} />
    </div>
  );
};

export default FichaGestion;