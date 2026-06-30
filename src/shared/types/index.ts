import React from 'react';

export type SelectOption<T = string> = {
  id: T;
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
export * from '../../features/ficha-deudor/types/telefono.types';
export * from '../../features/ficha-deudor/types/direccion.types';
export * from '../../features/ficha-deudor/types/popups/email.types';
export * from '../../features/ficha-deudor/types/popups/agenda.types';
export * from '../../features/ficha-deudor/types/popups/pago.types';
export * from '../../features/ficha-deudor/types/popups/infDeudor.types';
export * from '../../features/ficha-deudor/types/fichaGestion.types';