export const EMAIL_DEUDOR_POPUP_TEXTS = {
  logoText: 'EMAIL',
  logoSub: 'DEUDOR',
  navSection: 'GESTIÓN DE COBRANZAS',
  navActive: 'EMAILS',
  loading: 'Cargando emails...',
  errorTitle: 'Error al cargar emails',
  retryButton: 'Reintentar',
  closeButton: 'Cerrar',
  addButton: 'Agregar Email',
  addButtonIcon: '＋',
  editButtonIcon: '✎',
  tableEmptyMessage: 'No se encontraron emails',
  toolbarCountSuffix: 'email(s)',
  missingRegisterParams:
    'Faltan datos necesarios para registrar el email. Cierre esta ventana y vuelva a abrirla desde la ficha del deudor.',
  missingEditParams:
    'Faltan datos necesarios para editar el email. Cierre esta ventana y vuelva a abrirla desde la ficha del deudor.',
  missingSelectedEmail: 'No se encontró el email seleccionado para editar.',
  registerError:
    'No se pudo registrar el email. Intente nuevamente.',
  updateError:
    'No se pudo guardar la edición del email. Intente nuevamente.',
} as const;

export const EMAIL_DEUDOR_POPUP_COLUMNS = {
  id: 'Id',
  email: 'Email',
  fechaRegistro: 'Fecha Registro',
  estado: 'Estado',
  status: 'Status',
  fuente: 'Fuente',
  baseCliente: 'Base Cliente',
  contacto: 'Contacto',
  prioridad: 'Prioridad',
  comentario: 'Comentario',
  acciones: 'Editar',
} as const;

export const EMAIL_DEUDOR_POPUP_COLUMN_WIDTHS = {
  id: '80px',
  fechaRegistro: '120px',
  estado: '90px',
  status: '110px',
  prioridad: '80px',
  acciones: '55px',
} as const;

export const EMAIL_DEUDOR_POPUP_PAGE_SIZE_OPTIONS = [5, 10, 30, 50];

export const EMAIL_DEUDOR_POPUP_ESTADOS_BADGE: Record<string, string> = {
  ACTIVO: 'badge-s',
  INACTIVO: 'badge-d',
};

export const EMAIL_DEUDOR_POPUP_FALLBACK_TEXT = '—';