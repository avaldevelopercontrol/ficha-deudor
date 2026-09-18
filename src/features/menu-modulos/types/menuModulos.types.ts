import type {
  SisgesIconName,
} from '@shared/icons/sisges';

import type {
  MenuModuloAction,
} from '../constants/menuModuloActions.constants';

export type MenuModuloIconName =
  SisgesIconName;

export interface MenuModulo {
  key: string;
  label: string;
  breadcrumbLabel?: string;
  descripcion: string;
  icon: MenuModuloIconName;
  path?: string;
  action?: MenuModuloAction;
  children?: MenuModulo[];
  isEnabled?: boolean;
  badge?: string;
}
