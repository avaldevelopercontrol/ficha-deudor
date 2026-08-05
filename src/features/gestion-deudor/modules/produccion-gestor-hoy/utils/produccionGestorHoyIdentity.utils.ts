import {
  isPositiveIntegerValue,
  toRequiredId,
} from '@shared/utils/number.utils';

export interface ProduccionGestorHoyIdentity {
  idCliente: string;
  idUsuario: string;
}

export const resolveProduccionGestorHoyIdentity = (
  idCliente: unknown,
  idUsuario: unknown
): ProduccionGestorHoyIdentity | null => {
  if (
    !isPositiveIntegerValue(idCliente) ||
    !isPositiveIntegerValue(idUsuario)
  ) {
    return null;
  }

  return {
    idCliente: String(
      toRequiredId(idCliente, 'nId_Cliente')
    ),
    idUsuario: String(
      toRequiredId(idUsuario, 'nId_Usuario')
    ),
  };
};
