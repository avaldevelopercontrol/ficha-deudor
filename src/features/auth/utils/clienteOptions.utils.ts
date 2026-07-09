import type { SelectOption } from '@shared/types';
import type { Cliente } from '../types';

export const clienteToSelectOptions = (
  clientes: Cliente[]
): SelectOption<string>[] =>
  clientes.map((cliente) => ({
    id: cliente.id_cliente,
    label: cliente.nombre,
  }));
