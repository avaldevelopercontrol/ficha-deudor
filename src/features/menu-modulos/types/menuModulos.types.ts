import type {
  SisgesIconName,
} from '@shared/icons/sisges';

export type MenuModuloIconName =
  SisgesIconName;

export interface MenuModulo {
  key: string;
  label: string;
  breadcrumbLabel?: string;
  descripcion: string;
  icon: MenuModuloIconName;
  path?: string;
  children?: MenuModulo[];
  isEnabled?: boolean;
  badge?: string;
}
