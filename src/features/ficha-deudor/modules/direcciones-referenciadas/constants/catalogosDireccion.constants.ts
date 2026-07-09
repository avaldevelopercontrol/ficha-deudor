import type { SelectOption } from '@shared/types';

export const llegoDeBaseOptions: SelectOption<boolean>[] = [
  { id: true, label: 'BASE' },
  { id: false, label: ' ' }
];

export const tipoDeudorOptions: SelectOption[] = [
  { id: 'TITULAR', label: 'TITULAR' },
  { id: 'AVAL', label: 'AVAL' }
];

export const estadosDireccionOptions: SelectOption<boolean>[] = [
  { id: true, label: 'Activo' },
  { id: false, label: 'Inactivo'}
];