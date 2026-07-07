export const INF_DEUDOR_POPUP_TEXTS = {
  logoText: 'INF.',
  logoSub: 'DEUDOR',
  navSection: 'GESTIÓN DE COBRANZAS',
  navActive: 'INFORMACION ADICIONAL DEL DEUDOR',
  loading: 'Cargando información del deudor...',
  errorTitle: 'Error al cargar información',
  retryButton: 'Reintentar',
  closeButton: 'Cerrar',
  tableEmptyMessage: 'No se encontró información',
} as const;

export const INF_DEUDOR_POPUP_MESSAGES = {
  loadError: 'Error cargando información',
} as const;

export const INF_DEUDOR_POPUP_ROW_META = {
  cabeceraPrincipal: {
    id: 'cab_false',
    tipo: 'Cabecera Principal (false)',
  },
  cabeceraAdicional: {
    id: 'cab_true',
    tipo: 'Cabecera Adicional (true)',
  },
  valoresDeudor: {
    id: 'valores',
    tipo: 'Valores Deudor',
  },
} as const;

export const INF_DEUDOR_POPUP_API_PREFIXES = {
  cabecera: 'cNombre_Param',
  valores: 'cPersInf_Param',
} as const;

export const INF_DEUDOR_POPUP_COLUMNS_CONFIG = {
  start: 1,
  end: 80,
  label: ' ',
  widthWithData: 100,
  widthWithoutData: 1,
  totalWidthWithData: 100,
  totalWidthWithoutData: 40,
} as const;

export const INF_DEUDOR_POPUP_CELL_STYLE = {
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  lineHeight: '1.3',
  fontSize: 11,
} as const;