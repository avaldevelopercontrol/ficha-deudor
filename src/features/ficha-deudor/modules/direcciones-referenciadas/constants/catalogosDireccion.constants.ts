import {
  ESTADO_ACTIVO_INACTIVO_OPTIONS,
} from '@shared/constants/catalogOptions.constants';

import type {
  SelectOption,
} from '@shared/types';

export const llegoDeBaseOptions:
  SelectOption<boolean>[] = [
    {
      id: true,
      label: 'BASE',
    },
    {
      id: false,
      label: ' ',
    },
  ];

export const tipoDeudorOptions:
  SelectOption[] = [
    {
      id: 'TITULAR',
      label: 'TITULAR',
    },
    {
      id: 'AVAL',
      label: 'AVAL',
    },
  ];

export const estadosDireccionOptions =
  ESTADO_ACTIVO_INACTIVO_OPTIONS;