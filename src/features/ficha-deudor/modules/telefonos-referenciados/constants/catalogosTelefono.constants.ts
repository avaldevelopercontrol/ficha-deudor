import type { SelectOption } from '@shared/types';

export const prioridadesOptions: SelectOption[] = [
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '4', label: '4' },
  { id: '5', label: '5' },
  { id: '6', label: '6' },
  { id: '7', label: '7' },
  { id: '8', label: '8' },
  { id: '9', label: '9' },
  { id: '10', label: '10' },
  { id: '11', label: '11' },
];

export const referenciasOptions: SelectOption<number>[] = [
  { id: 1, label: 'Titular' },
  { id: 2, label: 'Posible Familiar' }
];

export const reclamoIndecopiOptions: SelectOption<boolean>[] = [
  { id: false, label: 'NO' },
  { id: true, label: 'SÍ' },
];