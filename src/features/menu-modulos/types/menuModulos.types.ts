export type MenuModuloIconName =
  | 'database'
  | 'dollar-sign'
  | 'users'
  | 'bar-chart'
  | 'file-text'
  | 'smartphone'
  | 'monitor'
  | 'sliders'
  | 'briefcase'
  | 'target'
  | 'mail'
  | 'phone'
  | 'user';

export interface MenuModulo {
  key: string;
  label: string;
  descripcion: string;
  icon: MenuModuloIconName;
  path?: string;
  children?: MenuModulo[];
  isEnabled?: boolean;
  badge?: string;
}