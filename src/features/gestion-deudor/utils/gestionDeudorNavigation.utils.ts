import type { FichaDeudorParams } from '@features/ficha-deudor/shared/types/fichaDeudor.types';

import type { DeudorGestionDeudor } from '../types/gestionDeudor.types';

interface BuildFichaDeudorParamsOptions {
  row: DeudorGestionDeudor;
  idCliente: string;
  idUsuario: string;
  fechaInicioGestion?: Date;
}

export const buildFichaDeudorParams = ({
  row,
  idCliente,
  idUsuario,
  fechaInicioGestion = new Date(),
}: BuildFichaDeudorParamsOptions): FichaDeudorParams => {
  return {
    id_cliente: String(row.nId_Cliente || idCliente),
    id_cartera: String(row.nId_Cartera),
    id_deudor: String(row.nId_PersDeudor),
    id_contrato: String(row.nId_Contrato),
    id_usuario: String(idUsuario),
    fecha_inicio_gestion: fechaInicioGestion.toISOString(),
  };
};