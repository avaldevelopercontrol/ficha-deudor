export const PAGO_DEUDOR_POPUP_TEXTS = {
  logoText: 'PAGOS',
  logoSub: 'DEUDOR',
  navSection: 'GESTIÓN DE COBRANZAS',
  navActive: 'PAGOS',
  loading: 'Cargando pagos...',
  errorTitle: 'Error al cargar pagos',
  retryButton: 'Reintentar',
  closeButton: 'Cerrar',
  tableEmptyMessage: 'No se encontraron pagos',
  toolbarCountSuffix: 'pago(s)',
} as const;

export const PAGO_DEUDOR_POPUP_COLUMNS = {
  nro: 'Nro',
  codigoCliente: 'Codigo Cliente',
  nroDocumento: 'Nro Documento',
  fechaPago: 'Fecha Pago',
  montoPago: 'Monto Pago',
  moneda: 'Moneda',
  zona: 'Zona',
  notaCredito: 'NC',
  marca: 'Marca',
} as const;

export const PAGO_DEUDOR_POPUP_COLUMN_WIDTHS = {
  nro: '60px',
  codigoCliente: '130px',
  nroDocumento: '160px',
  fechaPago: '110px',
  montoPago: '120px',
  moneda: '90px',
  zona: '100px',
  notaCredito: '100px',
  marca: '100px',
} as const;

export const PAGO_DEUDOR_POPUP_PAGE_SIZE_OPTIONS = [5, 10, 30, 50];

export const PAGO_DEUDOR_POPUP_MONEDA_SYMBOLS: Record<string, string> = {
  SOLES: 'S/',
  PEN: 'S/',
  DOLARES: '$',
  USD: '$',
};