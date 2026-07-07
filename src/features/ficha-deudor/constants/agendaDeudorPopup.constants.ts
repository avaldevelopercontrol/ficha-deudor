export const AGENDA_DEUDOR_POPUP_TEXTS = {
  logoText: 'AGENDAS',
  logoSub: 'DEUDOR',
  navSection: 'GESTIÓN DE COBRANZAS',
  navActive: 'AGENDAS REALIZADAS',
  loading: 'Cargando agendas...',
  errorTitle: 'Error al cargar agendas',
  retryButton: 'Reintentar',
  closeButton: 'Cerrar',
  tableEmptyMessage: 'No se encontraron agendas',
  toolbarCountSuffix: 'agenda(s)',
} as const;

export const AGENDA_DEUDOR_POPUP_COLUMNS = {
  id: 'Id',
  fechaNuevaGestion: 'Fech. Nueva Gestión',
  tiempoVencido: 'Tiempo Vencido',
  cartera: 'Cartera',
  deudor: 'Deudor',
  respuestaOEstado: 'Respuesta o Estado',
  usuario: 'Usuario',
} as const;

export const AGENDA_DEUDOR_POPUP_COLUMN_WIDTHS = {
  id: '80px',
  fechaNuevaGestion: '160px',
  tiempoVencido: '120px',
  respuestaOEstado: '180px',
  usuario: '100px',
} as const;

export const AGENDA_DEUDOR_POPUP_PAGE_SIZE_OPTIONS = [5, 10, 30, 50];

export const AGENDA_DEUDOR_POPUP_FALLBACK_TEXT = '—';