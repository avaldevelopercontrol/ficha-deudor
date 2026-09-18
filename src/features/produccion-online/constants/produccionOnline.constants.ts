import type {
  SelectOption,
} from '@shared/types';

import type {
  ProduccionOnlineFilters,
  ProduccionOnlineSortDirection,
  ProduccionOnlineSortKey,
} from '../types/produccionOnline.types';

export const PRODUCCION_ONLINE_DEFAULT_FILTERS:
  Readonly<ProduccionOnlineFilters> =
  Object.freeze({
    idCliente: 0,
    idPerfil: 2,
    idUbigeo: 0,
    idTipoLlamada: -1,
  });

export const PRODUCCION_ONLINE_TIPO_LLAMADA_OPTIONS:
  SelectOption<number>[] = [
    {
      id: -1,
      label: 'Todos',
    },
    {
      id: 1,
      label: 'Discador',
    },
    {
      id: 0,
      label: 'Manual',
    },
  ];

export const PRODUCCION_ONLINE_SORT_FIELD_OPTIONS:
  SelectOption<ProduccionOnlineSortKey | ''>[] = [
    {
      id: '',
      label: 'Sin orden adicional',
    },
    {
      id: 'contactosHora',
      label: 'Cont. x Hora',
    },
    {
      id: 'totalContactos',
      label: 'Total Cont.',
    },
    {
      id: 'totalGestiones',
      label: 'Total Gest.',
    },
  ];

export const PRODUCCION_ONLINE_SORT_DIRECTION_OPTIONS:
  SelectOption<ProduccionOnlineSortDirection>[] = [
    {
      id: 'desc',
      label: 'Mayor a menor',
    },
    {
      id: 'asc',
      label: 'Menor a mayor',
    },
  ];

export const PRODUCCION_ONLINE_PAGE_SIZE_OPTIONS = [
  10,
  20,
  30,
  50,
] as const;

export const PRODUCCION_ONLINE_TEXTS = {
  title: 'Producción online',
  logoText: 'PRODUCCIÓN',
  logoSub: 'ONLINE',
  navSection: 'MENÚ DE MÓDULOS',
  navActive: 'PRODUCCIÓN ONLINE',
  filtersTitle: 'Filtros de producción',
  filtersDescription:
    'Seleccione los criterios para actualizar el resumen de producción.',
  loadingCatalogs:
    'Cargando opciones de filtros...',
  catalogsErrorTitle:
    'No se pudieron cargar los filtros',
  catalogsError:
    'No se pudieron obtener las opciones de Producción online.',
  loadingSummary:
    'Cargando producción...',
  summaryErrorTitle:
    'No se pudo cargar la producción',
  summaryError:
    'No se pudo obtener el resumen de producción.',
  empty:
    'No se encontraron registros para los filtros seleccionados.',
  reset: 'Restablecer',
  retry: 'Reintentar',
  toolbarCountSuffix: 'registro(s)',
} as const;
