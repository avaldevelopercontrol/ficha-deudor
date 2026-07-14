import type React from 'react';

export type SelectOption<T = string> = {
  id: T;
  label: string;
};

type ColumnRender<TData> = {
  bivarianceHack(row: TData): React.ReactNode;
}['bivarianceHack'];

export interface Column<TData = unknown> {
  key: string;
  label: string;
  render?: ColumnRender<TData>;
  width?: string;
  filterable?: boolean;
  group?: string;
  groupLabel?: string;
  filterOptionLabel?: (value: string) => string;
}

export interface Ubigeo {
  id: string;
  nombre: string;
  provincias?: Provincia[];
}

export interface Provincia {
  id: string;
  nombre: string;
  distritos?: Distrito[];
}

export interface Distrito {
  id: string;
  nombre: string;
}

export * from '../../features/gestion-deudor/types/gestionDeudor.types';