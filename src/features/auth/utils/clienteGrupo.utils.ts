import {
  CLIENTE_GRUPO_TEMPORAL,
} from '../constants/clienteGrupo.constants';

import type {
  Cliente,
} from '../types/auth.types';

export const resolveClienteGrupoId = (
  cliente: Cliente | null | undefined
): number | null => {
  if (!cliente) {
    return null;
  }

  const groupId =
    CLIENTE_GRUPO_TEMPORAL[
      cliente.id_cliente
    ];

  return Number.isSafeInteger(groupId) &&
    Number(groupId) > 0
    ? Number(groupId)
    : null;
};
