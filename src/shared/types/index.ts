import React from 'react';

export interface SelectOption {
  id: string;
  label: string;
}

export interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
  width?: string;
  filterable?: boolean;
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

export * from '../../features/ficha-deudor/types/deudor.types';
export * from '../../features/ficha-deudor/types/gestion.types';
export * from '../../features/ficha-deudor/types/telefono.types';
export * from '../../features/ficha-deudor/types/direccion.types';