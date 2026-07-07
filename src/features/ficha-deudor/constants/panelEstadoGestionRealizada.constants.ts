export const PANEL_ESTADO_GESTION_REALIZADA_TITLE =
  'ESTADO DE GESTIÓN REALIZADA';

export const PANEL_ESTADO_GESTION_REALIZADA_EXPANDED_TITLE =
  'TODOS LOS ESTADOS DE GESTIÓN';

export const PANEL_ESTADO_GESTION_REALIZADA_MESSAGES = {
  LOADING: 'Cargando estados de gestión...',
  ERROR_TITLE: 'Error al cargar estados de gestión:',
  EMPTY: 'No se encontraron estados de gestión',
  ITEM_LABEL: 'estado(s) de gestión',
  VER_MAS: 'Ver más estados de gestiones',
  HISTORICAL_EMPTY: 'No se encontraron estados de gestión históricos',
  HISTORICAL_LOADING: 'Cargando estados de gestión históricos...',
  HISTORICAL_ERROR_TITLE: 'Error al cargar estados de gestión históricos:',
} as const;

export const PANEL_ESTADO_GESTION_REALIZADA_PAGE_SIZE_OPTIONS: number[] = [
  5,
  10,
  30,
  50,
];