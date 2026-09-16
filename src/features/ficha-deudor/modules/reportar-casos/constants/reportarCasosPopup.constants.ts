export const REPORTAR_CASOS_POPUP_TEXTS = {
  logoText: 'REPORTAR',
  logoSub: 'CASO',
  navSection: 'GESTIÓN DE COBRANZAS',
  navActive: 'CASOS REPORTADOS',
  loading: 'Cargando casos reportados...',
  errorTitle: 'Error al cargar casos reportados',
  retryButton: 'Reintentar',
  closeButton: 'Cerrar',
  addButton: 'Agregar caso',
  addButtonIcon: '＋',
  tableEmptyMessage: 'No se encontraron casos reportados',
  toolbarCountSuffix: 'caso(s)',
  registerError: 'No se pudo registrar el caso',
  updateError: 'No se pudo actualizar el caso',
} as const;

export const REPORTAR_CASOS_POPUP_COLUMNS = {
  id: 'Id',
  caso: 'Caso',
  descripcion: 'Descripción',
  cartera: 'Cartera',
  usuario: 'Usuario',
  fechaIngreso: 'Fec. Ingreso',
  acciones: 'Editar',
} as const;

export const REPORTAR_CASOS_POPUP_COLUMN_WIDTHS = {
  id: '70px',
  caso: '180px',
  cartera: '180px',
  usuario: '180px',
  fechaIngreso: '150px',
  acciones: '60px',
} as const;

export const REPORTAR_CASOS_POPUP_PAGE_SIZE_OPTIONS = [5, 10, 30, 50];
export const REPORTAR_CASOS_POPUP_FALLBACK_TEXT = '—';
