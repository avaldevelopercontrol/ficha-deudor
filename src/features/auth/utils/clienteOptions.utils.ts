import type { SelectOption } from '@shared/types';
import type { Cliente } from '../types';
import { buildClienteGrupoSelectionKey } from './clienteGrupo.utils';

const countClientesById = (
  clientes: Cliente[]
): ReadonlyMap<string, number> => {
  const counts = new Map<string, number>();

  for (const cliente of clientes) {
    counts.set(
      cliente.id_cliente,
      (counts.get(cliente.id_cliente) ?? 0) + 1
    );
  }

  return counts;
};

export const clienteToSelectOptions = (
  clientes: Cliente[]
): SelectOption<string>[] => {
  const clientCounts = countClientesById(clientes);

  return clientes.map((cliente) => ({
    id: buildClienteGrupoSelectionKey(cliente),
    label:
      (clientCounts.get(cliente.id_cliente) ?? 0) > 1
        ? `${cliente.nombre} (Grupo ${cliente.id_grupo})`
        : cliente.nombre,
  }));
};

export const aniosToSelectOptions = (
  anios: number[]
): SelectOption<number>[] =>
  anios.map((anio) => ({
    id: anio,
    label: String(anio),
  }));
