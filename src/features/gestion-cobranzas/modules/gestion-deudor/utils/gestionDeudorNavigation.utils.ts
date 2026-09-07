import type { FichaDeudorParams } from '@features/ficha-deudor/shared/types/fichaDeudor.types';
import {
  isPositiveIntegerValue,
  toRequiredId,
} from '@shared/utils/number.utils';

import type { DeudorGestionDeudor } from '../types/gestionDeudor.types';
import type { GestionDeudorIdentity } from './gestionDeudorIdentity.utils';

interface ResolveFichaDeudorParamsOptions {
  row: DeudorGestionDeudor;
  identity: GestionDeudorIdentity;
  fechaInicioGestion?: Date;
}

export const resolveFichaDeudorParams = ({
  row,
  identity,
  fechaInicioGestion = new Date(),
}: ResolveFichaDeudorParamsOptions): FichaDeudorParams | null => {
  const resolvedClientId =
    isPositiveIntegerValue(row.idCliente)
      ? row.idCliente
      : identity.idCliente;

  if (
    !isPositiveIntegerValue(resolvedClientId) ||
    !isPositiveIntegerValue(row.idCartera) ||
    !isPositiveIntegerValue(row.idDeudor) ||
    !isPositiveIntegerValue(row.idContrato) ||
    !isPositiveIntegerValue(identity.idUsuario)
  ) {
    return null;
  }

  return {
    id_cliente: String(
      toRequiredId(resolvedClientId, 'idCliente')
    ),
    id_cartera: String(
      toRequiredId(row.idCartera, 'idCartera')
    ),
    id_deudor: String(
      toRequiredId(row.idDeudor, 'idDeudor')
    ),
    id_contrato: String(
      toRequiredId(row.idContrato, 'idContrato')
    ),
    id_usuario: identity.idUsuario,
    fecha_inicio_gestion: fechaInicioGestion.toISOString(),
  };
};
