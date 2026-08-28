import {
  CLIENTE_GRUPO_SELECTION_SEPARATOR,
} from '../constants/clienteGrupo.constants';

import type { Cliente } from '../types/auth.types';

export const buildClienteGrupoSelectionKey = (
  cliente: Pick<Cliente, 'id_cliente' | 'id_grupo'>
): string =>
  `${cliente.id_cliente}${CLIENTE_GRUPO_SELECTION_SEPARATOR}${cliente.id_grupo}`;

export const resolveClienteGrupoId = (
  cliente: Cliente | null | undefined
): number | null => {
  const groupId = cliente?.id_grupo;

  return Number.isSafeInteger(groupId) && Number(groupId) > 0
    ? Number(groupId)
    : null;
};
