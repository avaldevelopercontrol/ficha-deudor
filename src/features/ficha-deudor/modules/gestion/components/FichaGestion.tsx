import React from 'react';

import type { DocumentoApi } from '../../../shared/types';
import { useFichaGestionViewModel } from '../hooks/useFichaGestionViewModel';
import type { GestionFormClaro } from '../types/fichaGestion.types';
import type { FichaDeudorGestionFormParams } from '../../../shared/types/fichaDeudor.types';
import FichaGestionDatosPrincipales from './FichaGestionDatosPrincipales';
import FichaGestionAccionesTomar from './FichaGestionAccionesTomar';
import FichaGestionResultadosLlamada from './FichaGestionResultadosLlamada';
import type { TelefonoReferenciado } from '../../telefonos-referenciados/types/telefono.types';

interface Props {
  params: FichaDeudorGestionFormParams;
  documentosFiltrados: DocumentoApi[];
  deudorNombre: string;
  carteraNombre: string;
  telefonoSeleccionado?: string;
  telefonosReferenciados: TelefonoReferenciado[];
  isLoadingTelefonosReferenciados: boolean;
  telefonosReferenciadosError: string | null;
  onSelectTelefono: (telefono: string) => void;
  onGestionGuardada?: (
    gestionTerminada: boolean
  ) => void;
  onSubmit?: (
    data: GestionFormClaro,
    fechaFinGestion: string
  ) => void;
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