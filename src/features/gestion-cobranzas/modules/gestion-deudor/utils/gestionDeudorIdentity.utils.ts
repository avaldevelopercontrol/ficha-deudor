import {
  isPositiveIntegerValue,
  toRequiredId,
} from '@shared/utils/number.utils';

export interface GestionDeudorIdentity {
  idCliente: string;
  idUsuario: string;
}

export const resolveGestionDeudorIdentity = (
  idCliente: unknown,
  idUsuario: unknown
): GestionDeudorIdentity | null => {
  if (
    !isPositiveIntegerValue(idCliente) ||
    !isPositiveIntegerValue(idUsuario)
  ) {
    return null;
  }

  return {
    idCliente: String(
      toRequiredId(idCliente, 'idCliente')
    ),
    idUsuario: String(
      toRequiredId(idUsuario, 'idUsuario')
    ),
  };
};
