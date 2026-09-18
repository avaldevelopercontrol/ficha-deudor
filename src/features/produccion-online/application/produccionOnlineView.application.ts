import type {
  SelectOption,
} from '@shared/types';

import {
  PRODUCCION_ONLINE_DEFAULT_FILTERS,
} from '../constants/produccionOnline.constants';
import type {
  ProduccionOnlineCatalogs,
  ProduccionOnlineFilters,
} from '../types/produccionOnline.types';

export type ProduccionOnlineFilterDependencies = readonly [
  idCliente: number,
  idPerfil: number,
  idUbigeo: number,
  idTipoLlamada: number,
];

export interface ProduccionOnlineCatalogOptions {
  provincias: SelectOption<number>[];
  perfiles: SelectOption<number>[];
  clientes: SelectOption<number>[];
}

const ALL_PROVINCIAS_OPTION: SelectOption<number> = {
  id: 0,
  label: 'Todas las ciudades',
};

const ALL_CLIENTES_OPTION: SelectOption<number> = {
  id: 0,
  label: 'Todos los clientes',
};

const prependOptionIfMissing = (
  options: readonly SelectOption<number>[],
  option: SelectOption<number>
): SelectOption<number>[] =>
  options.some(
    (current) => current.id === option.id
  )
    ? [...options]
    : [option, ...options];

export const createDefaultProduccionOnlineFilters =
  (): ProduccionOnlineFilters => ({
    ...PRODUCCION_ONLINE_DEFAULT_FILTERS,
  });

export const createProduccionOnlineFilterDependencies = (
  filters: ProduccionOnlineFilters
): ProduccionOnlineFilterDependencies => [
  filters.idCliente,
  filters.idPerfil,
  filters.idUbigeo,
  filters.idTipoLlamada,
];

export const buildProduccionOnlineCatalogOptions = (
  catalogs: ProduccionOnlineCatalogs | null | undefined
): ProduccionOnlineCatalogOptions => ({
  provincias: prependOptionIfMissing(
    catalogs?.provincias ?? [],
    ALL_PROVINCIAS_OPTION
  ),
  perfiles: [...(catalogs?.perfiles ?? [])],
  clientes: prependOptionIfMissing(
    catalogs?.clientes ?? [],
    ALL_CLIENTES_OPTION
  ),
});
