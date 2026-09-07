export const PRODUCCION_GESTOR_HOY_API_ENDPOINTS = {
  baseGestion: '/v1/Gestion',
  getGestionToDay: '/GetGestionToDay',
} as const;

export const PRODUCCION_GESTOR_HOY_TEXTS = {
  button:
    'PRODUCCION DEL GESTOR POR HORAS EN LAS CARTERAS DEL CLIENTE - HOY',

  logoText: 'PRODUCCIÓN',
  logoSub: 'GESTOR',

  navSection: 'GESTIÓN DE COBRANZAS',
  navActive:
    'PRODUCCIÓN DEL GESTOR POR HORAS - HOY',

  loading:
    'Cargando producción del gestor...',

  errorTitle:
    'Error al cargar la producción del gestor',

  retryButton: 'Reintentar',
  closeButton: 'Cerrar',

  tableEmptyMessage:
    'No se encontraron gestiones registradas para hoy.',

  missingParams:
    'No se encontraron el cliente y el usuario necesarios para consultar la producción.',

  loadError:
    'No se pudo cargar la producción del gestor por horas.',
} as const;

export const PRODUCCION_GESTOR_HOY_COLUMNS = {
  hora: 'Hora',
  totalGestionesTelefonicas: 'Total Ges.Tel.',
  contactos: 'Contactos',
  busquedas: 'Búsquedas',
  sms: 'SMS',
  noContactos: 'No Contactos',
  otros: 'Otros',
} as const;

export const PRODUCCION_GESTOR_HOY_COLUMN_WIDTHS = {
  hora: '110px',
  totalGestionesTelefonicas: '150px',
  contactos: '130px',
  busquedas: '130px',
  sms: '100px',
  noContactos: '150px',
  otros: '110px',
} as const;

export const PRODUCCION_GESTOR_HOY_TABLE_TOTAL_WIDTH =
  880;