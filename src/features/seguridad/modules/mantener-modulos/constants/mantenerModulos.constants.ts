export const MANTENER_MODULOS_TEXTS = {
  sectionTitle:
    'Módulos registrados',

  sectionDescription:
    'Consulte los módulos y opciones disponibles en el sistema.',

  loadingMessage:
    'Cargando módulos...',

  emptyMessage:
    'No se encontraron módulos para mostrar.',

  addAction:
    'Agregar módulo',

  editAction:
    'Editar módulo',

  editUnavailable:
    'La edición estará disponible cuando se integre el endpoint de mantenimiento.',
} as const;

export const MANTENER_MODULOS_COLUMNS = {
  idModulo:
    'Id',

  nombre:
    'Nombre',

  ruta:
    'Ruta',

  padre:
    'Padre',

  nivel:
    'Nivel',

  visible:
    'Visible',

  estado:
    'Estado',

  editar:
    'Editar',
} as const;

export const MANTENER_MODULOS_COLUMN_WIDTHS = {
  idModulo: '9%',
  nombre: '20%',
  ruta: '20%',
  padre: '15%',
  nivel: '9%',
  visible: '9%',
  estado: '11%',
  editar: '7%',
} as const;

export const MANTENER_MODULOS_PAGE_SIZE_OPTIONS = [
  5,
  10,
  15,
  30,
] as const;
