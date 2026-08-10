import type { SelectOption } from '@shared/types';

export const ESTADO_ACTIVO_INACTIVO_OPTIONS:
  SelectOption<boolean>[] = [
    {
      id: true,
      label: 'Activo',
    },
    {
      id: false,
      label: 'Inactivo',
    },
  ];