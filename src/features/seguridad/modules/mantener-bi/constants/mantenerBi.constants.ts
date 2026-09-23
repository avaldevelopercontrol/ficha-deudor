export const MANTENER_BI_TEXTS = {
  sectionTitle:
    'BI registrados',

  sectionDescription:
    'Consulte los módulos BI configurados en el nivel 4 y su estado de implementación.',

  loadingMessage:
    'Cargando BI...',

  emptyMessage:
    'No se encontraron módulos BI para mostrar.',

  addAction:
    'Agregar BI',

  addUnavailable:
    'No tiene permiso para agregar BI.',

  powerBiParentUnavailable:
    'Primero registre el módulo Reportería para poder agregar BI.',

  registerTitle:
    'Registrar nuevo BI',

  registerSubmitLabel:
    'Registrar',

  registerLoadingLabel:
    'Registrando...',

  registerValidationSummary:
    'Revise los siguientes campos antes de registrar:',

  editAction:
    'Editar BI',

  editUnavailable:
    'No se puede editar el BI en este momento.',

  editTitle:
    'Editar BI',

  editSubmitLabel:
    'Guardar cambios',

  editLoadingLabel:
    'Guardando...',

  editValidationSummary:
    'Revise los siguientes campos antes de guardar:',
} as const;

export const MANTENER_BI_COLUMNS = {
  idModulo:
    'Id',

  nombre:
    'Nombre',

  implementacion:
    'Implementación',

  visible:
    'Visible',

  estado:
    'Estado',

  editar:
    'Editar',
} as const;

export const MANTENER_BI_COLUMN_WIDTHS = {
  idModulo: '9%',
  nombre: '31%',
  implementacion: '22%',
  visible: '12%',
  estado: '16%',
  editar: '10%',
} as const;

export const MANTENER_BI_PAGE_SIZE_OPTIONS = [
  5,
  10,
  15,
  30,
] as const;
