import type {
  SelectOption,
} from '@shared/types';

export interface ProduccionOnlineFilters {
  idCliente: number;
  idPerfil: number;
  idUbigeo: number;
  idTipoLlamada: number;
}

export interface ProduccionOnlineCatalogs {
  provincias: SelectOption<number>[];
  perfiles: SelectOption<number>[];
  clientes: SelectOption<number>[];
}

export interface ProduccionOnlineRow {
  id: number;
  nombres: string;
  contactosHora: number;
  totalContactos: number;
  totalGestiones: number;
  cartera: string;
}

export type ProduccionOnlineSortKey =
  | 'contactosHora'
  | 'totalContactos'
  | 'totalGestiones';

export type ProduccionOnlineSortDirection =
  | 'asc'
  | 'desc';
