export const PANEL_GESTION_REALIZADA_TITLE = 'GESTIÓN REALIZADA';

export const PANEL_GESTION_REALIZADA_MESSAGES = {
  EMPTY: 'No se encontraron gestiones realizadas',
  ITEM_LABEL: 'gestión(es)',
  LOADING: 'Cargando gestiones...',
  ERROR_TITLE: 'Error al cargar gestiones:',
  VER_MAS: 'Ver más gestiones realizadas',
} as const;

export const PANEL_GESTION_REALIZADA_PAGE_SIZE_OPTIONS: Record<
  'RESUMEN' | 'EXPANDIDA',
  number[]
> = {
  RESUMEN: [5, 10, 20, 50],
  EXPANDIDA: [5, 10, 30, 50],
};

export const buildEliminarGestionConfirmMessage = (nro: string | number) => {
  return `¿Eliminar gestión N° ${nro}?`;
};