export const LISTA_GESTORES_POPUP_TEXTS = {
  logoText: 'LISTA',
  logoSub: 'GESTORES',
  navSection: 'GESTIÓN DE COBRANZAS',
  navActive: 'LISTA DE GESTORES',
  loading: 'Cargando gestores...',
  errorTitle: 'Error al cargar gestores',
  retryButton: 'Reintentar',
  closeButton: 'Cerrar',
  tableEmptyMessage: 'No se encontraron gestores',
  toolbarCountSuffix: 'gestor(es)',
  selectButton: 'Seleccionar',
} as const;

export const LISTA_GESTORES_POPUP_COLUMNS = {
  id: 'Id',
  nombre: 'Nombre',
  perfil: 'Perfil',
  login: 'Login',
  subZona: 'Sub Zonal',
  codRecaudacion: 'Codigo Rec.',
  acciones: 'Acciones',
} as const;

export const LISTA_GESTORES_POPUP_COLUMN_WIDTHS = {
  id: '80px',
  nombre: '260px',
  perfil: '180px',
  login: '120px',
  subZona: '140px',
  codRecaudacion: '120px',
  acciones: '110px',
} as const;

export const LISTA_GESTORES_POPUP_PAGE_SIZE_OPTIONS = [5, 10, 30, 50];

export const LISTA_GESTORES_POPUP_FALLBACK_TEXT = '—';