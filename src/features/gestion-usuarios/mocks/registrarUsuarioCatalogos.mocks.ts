import type {
  SelectOption,
} from '@shared/types';

import type {
  SexoUsuarioValue,
} from '../modules/mantener-usuario/types/registrarUsuario.types';

export const SEXOS_USUARIO_OPTIONS:
  SelectOption<SexoUsuarioValue>[] = [
    {
      id: 1,
      label: 'Masculino',
    },
    {
      id: 2,
      label: 'Femenino',
    },
  ];