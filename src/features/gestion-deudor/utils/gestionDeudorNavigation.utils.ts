import type { FichaDeudorParams } from '@features/ficha-deudor/shared/types/fichaDeudor.types';
import {
  toOptionalIdOrZero,
  toRequiredId,
} from '@shared/utils/number.utils';

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
  const rowClientId = toOptionalIdOrZero(
    row.nId_Cliente,
    'nId_Cliente'
  );
  const resolvedClientId = rowClientId ||
    toRequiredId(idCliente, 'idCliente');

  return {
    id_cliente: String(resolvedClientId),
    id_cartera: String(
      toRequiredId(row.nId_Cartera, 'nId_Cartera')
    ),
    id_deudor: String(
      toRequiredId(row.nId_PersDeudor, 'nId_PersDeudor')
    ),
    id_contrato: String(
      toRequiredId(row.nId_Contrato, 'nId_Contrato')
    ),
    id_usuario: String(
      toRequiredId(idUsuario, 'idUsuario')
    ),
    fecha_inicio_gestion: fechaInicioGestion.toISOString(),
  };
};
